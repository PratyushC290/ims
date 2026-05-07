import { Request } from "../models/Request.js";
import { User } from "../models/User.js";
import { Item } from "../models/Item.js";
import { IssuedAsset } from "../models/IssuedAsset.js";
import { History } from "../models/History.js";
import { uploadToGridFS, streamFromGridFS } from "../config/gridfs.js";

export const createRequest = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { items, location, reason } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0 || !location || !reason) {
      return res.status(400).json({ message: "items array, location, and reason are required." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!["Student", "Faculty"].includes(user.role)) {
      return res.status(403).json({ message: "Only students and faculty can create requests." });
    }

    const newRequest = await Request.create({
      user: userId,
      items,
      location,
      reason,
    });

    res.status(201).json({
      message: "Request created successfully.",
      request: newRequest,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getMyRequests = async (req, res) => {
  try {
    const userId = req.user.userId;

    const requests = await Request.find({ user: userId })
      .populate("user", "fullname instituteEmail role studentId branch phoneNumber alternativeEmail phdGuide")
      .sort({ createdAt: -1 });

    res.status(200).json({ requests });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllRequests = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const pipeline = [
      { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "userData" } },
      { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } },
    ];

    const matchConditions = [];

    if (status) {
      const statusList = status.split(",");
      if (statusList.length > 1) {
        matchConditions.push({ status: { $in: statusList } });
      } else {
        matchConditions.push({ status });
      }
    }

    if (search) {
      matchConditions.push({
        $or: [
          { "items.itemType": { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } },
          { reason: { $regex: search, $options: "i" } },
          { "userData.fullname": { $regex: search, $options: "i" } },
          { "userData.instituteEmail": { $regex: search, $options: "i" } },
          { "userData.studentId": { $regex: search, $options: "i" } },
        ],
      });
    }

    if (matchConditions.length > 0) {
      pipeline.push({ $match: { $and: matchConditions } });
    }

    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await Request.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    pipeline.push({ $sort: { createdAt: 1 } });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limitNum });

    const requests = await Request.aggregate(pipeline);

    const requestsWithUser = requests.map((r) => ({
      ...r,
      user: r.userData || null,
    }));

    res.status(200).json({
      requests: requestsWithUser,
      pagination: {
        totalRequests: total,
        totalPages: Math.ceil(total / limitNum),
        currentPage: pageNum,
        itemsPerPage: limitNum,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required." });
    }

    const validStatuses = ["Approved", "Rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be 'Approved' or 'Rejected'." });
    }

    const request = await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: "Request not found." });
    }

    if (request.status !== "Pending") {
      return res.status(400).json({ message: "Can only update pending requests." });
    }

    request.status = status;
    await request.save();

    res.status(200).json({
      message: `Request ${status.toLowerCase()} successfully.`,
      request,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const fulfillRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    let { assignments, items: adminItems } = req.body;

    // Parse strings if sent via FormData
    if (typeof assignments === 'string') {
      assignments = JSON.parse(assignments);
    }
    if (typeof adminItems === 'string') {
      adminItems = JSON.parse(adminItems);
    }

    console.log("Backend fulfillRequest:", { adminItems, assignments });

    // Support flexible fulfillment: admin-provided items OR fallback to request items
    const isFlexibleFulfillment = adminItems && Array.isArray(adminItems);
    
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found." });
    }

    if (request.status !== "Approved" && request.status !== "Pending") {
      return res.status(400).json({ message: "Can only fulfill pending or approved requests." });
    }

    const itemsToFulfill = isFlexibleFulfillment ? adminItems : request.items;

    // Validation Phase
    const catalogUpdates = [];
    const newIssuedAssets = [];
    const historyLogs = [];

    for (const item of itemsToFulfill) {
      const itemType = item.itemType;
      const quantity = item.quantity;
      
      if (!itemType || !quantity || quantity < 1) {
        return res.status(400).json({ message: "Each item must have a valid itemType and quantity >= 1." });
      }

      // Identifiers are now mandatory
      const identifiers = assignments?.[itemType] || [];
      
      // Prefer itemId if provided, otherwise fallback to name lookup
      let catalogItem;
      if (item.itemId) {
        catalogItem = await Item.findById(item.itemId);
      } else {
        catalogItem = await Item.findOne({ name: itemType });
      }
      
      if (!catalogItem) {
        return res.status(404).json({ message: item.itemId 
          ? `Item not found.` 
          : `Catalog item '${itemType}' not found in Inventory.` 
        });
      }

      if (catalogItem.availableQuantity < quantity) {
        return res.status(400).json({ message: `Not enough stock available for ${catalogItem.name}. Available: ${catalogItem.availableQuantity}` });
      }

      console.log("Validation for", itemType, ": quantity=", quantity, "identifiers=", identifiers, "length=", identifiers.length);

      if (identifiers.length === 0 || identifiers.length !== quantity) {
        return res.status(400).json({ message: `Must provide exactly ${quantity} identifier(s) for ${itemType}.` });
      }

      // Validate each identifier if provided
      for (const id of identifiers) {
        if (!id.trim()) {
           return res.status(400).json({ message: "Identifier cannot be empty." });
        }
        const existing = await IssuedAsset.findOne({ identifier: id.trim(), status: "Issued" });
        if (existing) {
          return res.status(400).json({ message: `Identifier '${id.trim()}' is already issued.` });
        }

        newIssuedAssets.push({
          user: request.user,
          catalogItem: catalogItem._id,
          identifier: id.trim(),
          status: "Issued",
          request: request._id,
        });

        historyLogs.push({
          item: catalogItem._id,
          action: "Assigned",
          targetUser: request.user,
          authorizedBy: req.user.userId,
          notes: `${id.trim()} - Fulfilled for ${itemType}`,
        });
      }

      catalogUpdates.push({
        catalogItem,
        quantityToDeduct: quantity,
      });
    }

    // Execution Phase
    for (const update of catalogUpdates) {
      update.catalogItem.availableQuantity -= update.quantityToDeduct;
      await update.catalogItem.save();
    }

    if (newIssuedAssets.length > 0) {
      await IssuedAsset.insertMany(newIssuedAssets);
    }
    
    if (historyLogs.length > 0) {
      await History.insertMany(historyLogs);
    }

    if (req.file) {
      const fileId = await uploadToGridFS(req.file);
      request.documentFileId = fileId;
    }

    request.status = "Fulfilled";
    await request.save();

    res.status(200).json({
      message: "Request fulfilled successfully.",
      request,
      fulfilledItems: itemsToFulfill,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const uploadRequestDocument = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: "Request not found." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No document provided." });
    }

    const fileId = await uploadToGridFS(req.file);
    request.documentFileId = fileId;
    await request.save();

    res.status(200).json({
      message: "Document attached successfully.",
      request,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const streamRequestDocument = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await Request.findById(requestId);

    if (!request || !request.documentFileId) {
      return res.status(404).json({ message: "Document not found." });
    }

    res.set("Content-Type", "application/pdf");
    streamFromGridFS(request.documentFileId, res);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};