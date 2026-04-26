import { Item } from "../models/Item.js";
import { User } from "../models/User.js";
import { History } from "../models/History.js";
import { Notification } from "../models/Notification.js";

export const createItem = async (req, res) => {
  try {
    const { itemType, identifier } = req.body;
    const newItem = await Item.create({
      itemType,
      identifier,
      status: "Available",
      assignedTo: null,
    });

    res.status(201).json({
      message: "Item added to inventory successfully.",
      item: newItem,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "An item with this identifier already exists." });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllItems = async (req, res) => {
  try {
    const { status, itemType, search } = req.query;

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    let query = {};
    if (status) query.status = status;
    if (itemType) query.itemType = itemType;
    if (search) {
      query.identifier = { $regex: search, $options: "i" };
    }

    const [items, totalItems] = await Promise.all([
      Item.find(query)
        .populate("assignedTo", "fullname instituteEmail role")
        .populate("itemType", "name category thumbnail")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Item.countDocuments(query),
    ]);

    res.status(200).json({
      items,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const assignItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const item = await Item.findOneAndUpdate(
      { _id: itemId, status: "Available" },
      { status: "Assigned", assignedTo: user._id },
      { new: true },
    ).populate("assignedTo", "fullname instituteEmail role");

    if (!item) {
      return res.status(400).json({
        message:
          "Item cannot be assigned. It may not exist, or it has already been assigned.",
      });
    }

    await History.create({
      item: item._id,
      action: "Assigned",
      targetUser: user._id,
      authorizedBy: req.user.userId,
    });

    res.status(200).json({
      message: `${item.name} has been successfully assigned to ${user.fullname}.`,
      item,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const returnItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const oldItem = await Item.findOneAndUpdate(
      { _id: itemId, status: "Assigned" },
      { status: "Available", assignedTo: null },
      { new: false },
    );

    if (!oldItem) {
      return res.status(400).json({
        message:
          "Item cannot be returned. It is not currently assigned to anyone.",
      });
    }

    await History.create({
      item: oldItem._id,
      action: "Returned",
      targetUser: oldItem.assignedTo,
      authorizedBy: req.user.userId,
    });

    const updatedItem = await Item.findById(itemId);

    res.status(200).json({
      message: `${updatedItem.name} has been returned to the inventory.`,
      item: updatedItem,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createBulkItems = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Please provide an array of items." });
    }

    const formattedItems = items.map((item) => ({
      itemType: item.itemType,
      identifier: item.identifier,
      status: "Available",
      assignedTo: null,
    }));

    const insertedItems = await Item.insertMany(formattedItems, {
      ordered: false,
    });

    res.status(201).json({
      message: `Successfully added ${insertedItems.length} items to the inventory.`,
      count: insertedItems.length,
    });
  } catch (error) {
    if (error.code === 11000 && error.result && error.result.nInserted > 0) {
      return res.status(207).json({
        message: `Partial success. Added ${error.result.nInserted} items. Some identifiers already existed and were skipped.`,
        count: error.result.nInserted,
      });
    }

    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const toggleMaintenance = async (req, res) => {
  try {
    // FIX 1: Checks for both 'itemId' and 'id' so it won't break regardless of how your router is named
    const itemId = req.params.itemId || req.params.id;

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }

    const currentStatus = item.status;
    let newStatus;

    if (currentStatus === "Under Maintenance") {
      newStatus = "Available";
    } else if (currentStatus === "Available" || currentStatus === "Assigned") {
      newStatus = "Under Maintenance";
    } else {
      return res
        .status(400)
        .json({ message: "Cannot change maintenance status." });
    }

    // FIX 2: Save who currently has the item BEFORE we wipe it, so we can log it in history!
    const previousOwner = item.assignedTo;

    item.status = newStatus;
    if (newStatus === "Under Maintenance") {
      item.assignedTo = null;
    }

    await item.save();

    const logAction =
      newStatus === "Under Maintenance"
        ? "Sent to Maintenance"
        : "Removed from Maintenance";

    await History.create({
      item: item._id,
      action: logAction,
      // FIX 3: If it broke while someone had it, log them! Otherwise, log null.
      targetUser: newStatus === "Under Maintenance" ? previousOwner : null,
      // FIX 4: Fallbacks to ensure the auth ID doesn't crash the history creation
      authorizedBy: req.user.userId || req.user._id || req.user.id,
    });

    res.status(200).json({
      message: `${item.name} is now ${item.status}.`,
      item: item,
    });
  } catch (error) {
    console.error("Toggle Maintenance Error:", error); // Will print the exact crash in your terminal
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
