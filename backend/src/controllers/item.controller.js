import { Item } from "../models/Item.js";
import { User } from "../models/User.js";
import { History } from "../models/History.js";
import { Notification } from "../models/Notification.js";
import { ActionLog } from "../models/ActionLog.js";

export const createItem = async (req, res) => {
  try {
    const { identifier, folder } = req.body;
    const newItem = await Item.create({
      identifier,
      status: "Available",
      assignedTo: null,
      folder: folder || null,
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
    const { status, category, search, folder } = req.query;

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    let query = {};
    if (status) query.status = status;
    if (folder !== undefined) query.folder = folder === "null" ? null : folder;
    if (search) {
      query.$or = [
        { identifier: { $regex: search, $options: "i" } },
      ];
    }

    const [items, totalItems] = await Promise.all([
      Item.find(query)
        .populate("assignedTo", "fullname instituteEmail role")
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
      message: `Asset ${item.identifier} has been successfully assigned to ${user.fullname}.`,
      item,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const returnItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { image } = req.body;

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
      image: image || null,
    });

    const updatedItem = await Item.findById(itemId);

    res.status(200).json({
      message: `Asset ${updatedItem.identifier} has been returned to the inventory.`,
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
      message: `Asset ${item.identifier} is now ${item.status}.`,
      item: item,
    });
  } catch (error) {
    console.error("Toggle Maintenance Error:", error); // Will print the exact crash in your terminal
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const moveItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { newFolderId } = req.body;
    
    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ message: "Item not found." });
    
    const previousFolder = item.folder;
    item.folder = newFolderId || null;
    await item.save();

    res.status(200).json({ message: "Item moved successfully.", item });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const bulkAssignFolder = async (req, res) => {
  try {
    const { folderId, userId } = req.body;
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    const items = await Item.find({ folder: folderId, status: "Available" });
    if (items.length === 0) return res.status(400).json({ message: "No available items found in this folder." });

    const itemIds = items.map(i => i._id);
    await Item.updateMany(
      { _id: { $in: itemIds } },
      { $set: { status: "Assigned", assignedTo: user._id } }
    );

    const actionLog = await ActionLog.create({
      actionType: "BULK_ASSIGN",
      targetIds: itemIds,
      targetType: "Item",
      previousState: { status: "Available", assignedTo: null },
      userId: req.user.userId || req.user._id || req.user.id
    });

    res.status(200).json({ 
      message: `Assigned ${items.length} items to ${user.fullname}.`,
      actionLogId: actionLog._id
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const bulkUnassignFolder = async (req, res) => {
  try {
    const { folderId } = req.body;
    
    const items = await Item.find({ folder: folderId, status: "Assigned" });
    if (items.length === 0) return res.status(400).json({ message: "No assigned items found in this folder." });

    const itemIds = items.map(i => i._id);
    
    // Store previous states to undo properly
    const previousStates = items.map(i => ({ itemId: i._id, assignedTo: i.assignedTo }));

    await Item.updateMany(
      { _id: { $in: itemIds } },
      { $set: { status: "Available", assignedTo: null } }
    );

    const actionLog = await ActionLog.create({
      actionType: "BULK_UNASSIGN",
      targetIds: itemIds,
      targetType: "Item",
      previousState: previousStates,
      userId: req.user.userId || req.user._id || req.user.id
    });

    res.status(200).json({ 
      message: `Unassigned ${items.length} items.`,
      actionLogId: actionLog._id
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const undoAction = async (req, res) => {
  try {
    const { actionLogId } = req.params;
    
    const actionLog = await ActionLog.findById(actionLogId);
    if (!actionLog) return res.status(404).json({ message: "Action log not found." });
    if (actionLog.isReverted) return res.status(400).json({ message: "Action already reverted." });

    if (actionLog.actionType === "BULK_ASSIGN") {
      await Item.updateMany(
        { _id: { $in: actionLog.targetIds } },
        { $set: { status: "Available", assignedTo: null } }
      );
    } else if (actionLog.actionType === "BULK_UNASSIGN") {
      // Reassign to respective users
      const bulkOps = actionLog.previousState.map(state => ({
        updateOne: {
          filter: { _id: state.itemId },
          update: { $set: { status: "Assigned", assignedTo: state.assignedTo } }
        }
      }));
      if (bulkOps.length > 0) {
        await Item.bulkWrite(bulkOps);
      }
    }

    actionLog.isReverted = true;
    await actionLog.save();

    res.status(200).json({ message: "Action undone successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const deletedItem = await Item.findByIdAndDelete(itemId);
    if (!deletedItem) {
      return res.status(404).json({ message: "Item not found." });
    }
    await History.deleteMany({ item: itemId });
    res.status(200).json({ message: "Item deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getItemHistory = async (req, res) => {
  try {
    const { itemId } = req.params;
    const history = await History.find({ item: itemId })
      .populate("targetUser", "fullname instituteEmail")
      .populate("authorizedBy", "fullname")
      .sort({ createdAt: -1 });
    res.status(200).json({ history });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
