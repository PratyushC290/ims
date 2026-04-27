import { Request } from "../models/Request.js";
import { User } from "../models/User.js";
import { Item } from "../models/Item.js";
import { IssuedAsset } from "../models/IssuedAsset.js";
import { History } from "../models/History.js";

export const createRequest = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { requestedItem, reason } = req.body;

    if (!requestedItem || !reason) {
      return res.status(400).json({ message: "requestedItem and reason are required." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.role !== "Student") {
      return res.status(403).json({ message: "Only students can create requests." });
    }

    const newRequest = await Request.create({
      user: userId,
      requestedItem,
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
      query.status = status;
    }

    if (search) {
      query.$or = [
        { requestedItem: { $regex: search, $options: "i" } },
        { reason: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [requests, total] = await Promise.all([
      Request.find(query)
        .populate("user", "fullname instituteEmail role")
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
    const { catalogItemId, identifier } = req.body;

    if (!catalogItemId || !identifier) {
      return res.status(400).json({ message: "catalogItemId and identifier are required." });
    }

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found." });
    }

    if (request.status !== "Pending" && request.status !== "Approved") {
      return res.status(400).json({ message: "Can only fulfill pending or approved requests." });
    }

    const catalogItem = await Item.findById(catalogItemId);
    if (!catalogItem) {
      return res.status(404).json({ message: "Catalog item not found." });
    }

    if (catalogItem.availableQuantity <= 0) {
      return res.status(400).json({ message: "No available stock." });
    }

    const existing = await IssuedAsset.findOne({ identifier });
    if (existing) {
      return res.status(400).json({ message: "This identifier is already issued to someone else." });
    }

    catalogItem.availableQuantity -= 1;
    await catalogItem.save();

    const issuedAsset = await IssuedAsset.create({
      user: request.user,
      catalogItem: catalogItemId,
      identifier,
      status: "Issued",
      request: requestId,
    });

    request.status = "Fulfilled";
    request.assignedItem = catalogItemId;
    await request.save();

    await History.create({
      item: catalogItemId,
      action: "Issued",
      targetUser: request.user,
      authorizedBy: req.user.userId,
      notes: `${identifier} - Fulfilled request for ${request.requestedItem}`,
    });

    res.status(200).json({
      message: "Request fulfilled successfully.",
      request,
      issuedAsset,
      catalogItem,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};