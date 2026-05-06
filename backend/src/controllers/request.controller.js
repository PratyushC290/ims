import { Request } from "../models/Request.js";
import { User } from "../models/User.js";
import { Item } from "../models/Item.js";
import { IssuedAsset } from "../models/IssuedAsset.js";
import { History } from "../models/History.js";

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

    let query = {};

    if (status) {
      const statusList = status.split(",");
      if (statusList.length > 1) {
        query.status = { $in: statusList };
      } else {
        query.status = status;
      }
    }

    if (search) {
      query.$or = [
        { "items.itemType": { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { reason: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [requests, total] = await Promise.all([
      Request.find(query)
        .populate("user", "fullname instituteEmail role studentId branch phoneNumber alternativeEmail phdGuide")
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Request.countDocuments(query),
    ]);

    res.status(200).json({
      requests,
      pagination: {
        totalRequests: total,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        itemsPerPage: parseInt(limit),
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
    const { assignments, items: adminItems } = req.body;

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