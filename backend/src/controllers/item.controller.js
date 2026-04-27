import { Item } from "../models/Item.js";
import { IssuedAsset } from "../models/IssuedAsset.js";
import { User } from "../models/User.js";
import { History } from "../models/History.js";
import { Folder } from "../models/Folder.js";
import { ActionLog } from "../models/ActionLog.js";

export const createItem = async (req, res) => {
  try {
    const { name, category, description, totalQuantity, folder } = req.body;

    if (!name || !totalQuantity) {
      return res.status(400).json({ message: "Name and total quantity are required." });
    }

    const newItem = await Item.create({
      name,
      category: category || "General",
      description: description || "",
      totalQuantity: Number(totalQuantity),
      availableQuantity: Number(totalQuantity),
      folder: folder || null,
    });

    res.status(201).json({
      message: "Item added to catalog successfully.",
      item: newItem,
    });
  } catch (error) {
    console.error("CreateItem Error:", error); // Debug log
    res.status(500).json({ 
      message: "Server error", 
      error: error.message,
      stack: error.stack,
      code: error.code,
      keyPattern: error.keyPattern
    });
  }
};

const getDescendantFolders = async (parentId) => {
  const children = await Folder.find({ parent: parentId });
  let descendants = [...children.map(c => c._id)];
  for (let child of children) {
    descendants = descendants.concat(await getDescendantFolders(child._id));
  }
  return descendants;
};

export const getAllItems = async (req, res) => {
  try {
    const { status, category, search, folder } = req.query;

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } }
      ];
    }
    
    if (category) {
      query.category = category;
    }

    if (folder !== undefined) {
      if (folder && folder !== "null") {
        const descendantIds = await getDescendantFolders(folder);
        query.folder = { $in: [folder, ...descendantIds] };
      }
    }

    const [items, totalItems] = await Promise.all([
      Item.find(query)
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

export const updateItemStock = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { totalQuantity } = req.body;

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }

    if (totalQuantity !== undefined) {
      const oldTotal = item.totalQuantity;
      const oldAvailable = item.availableQuantity;
      const diff = Number(totalQuantity) - oldTotal;
      
      item.totalQuantity = Number(totalQuantity);
      item.availableQuantity = Math.max(0, oldAvailable + diff);
    }

    await item.save();

    res.status(200).json({
      message: "Item stock updated.",
      item,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { name, category, totalQuantity } = req.body;

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }

    if (name) item.name = name;
    if (category !== undefined) item.category = category;
    
    if (totalQuantity !== undefined && totalQuantity !== item.totalQuantity) {
      const diff = Number(totalQuantity) - item.totalQuantity;
      item.totalQuantity = Number(totalQuantity);
      item.availableQuantity = Math.max(0, item.availableQuantity + diff);
    }

    await item.save();

    res.status(200).json({
      message: "Item updated successfully.",
      item,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const issueAsset = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { userId, identifier, requestId, notes } = req.body;

    if (!userId || !identifier) {
      return res.status(400).json({ message: "User ID and identifier are required." });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    const catalogItem = await Item.findById(itemId);
    if (!catalogItem) return res.status(404).json({ message: "Catalog item not found." });

    if (catalogItem.availableQuantity <= 0) {
      return res.status(400).json({ message: "No available stock." });
    }

    const existing = await IssuedAsset.findOne({ identifier });
    if (existing) {
      return res.status(400).json({ message: "This identifier is already issued." });
    }

    catalogItem.availableQuantity -= 1;
    await catalogItem.save();

    const issuedAsset = await IssuedAsset.create({
      user: userId,
      catalogItem: itemId,
      identifier,
      status: "Issued",
      request: requestId || null,
      notes: notes || "",
    });

    await History.create({
      item: catalogItem._id,
      action: "Issued",
      targetUser: user._id,
      authorizedBy: req.user.userId,
      notes: `${identifier} - ${notes || ""}`,
    });

    res.status(201).json({
      message: `Asset ${identifier} issued to ${user.fullname}.`,
      issuedAsset,
      catalogItem,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const returnAsset = async (req, res) => {
  try {
    const { issuedAssetId } = req.params;
    const notes = req.body?.notes || "";

    const issuedAsset = await IssuedAsset.findById(issuedAssetId).populate("catalogItem");
    if (!issuedAsset) {
      return res.status(404).json({ message: "Issued asset not found." });
    }

    if (issuedAsset.status !== "Issued") {
      return res.status(400).json({ message: "Asset is not currently issued." });
    }

    const catalogItem = await Item.findById(issuedAsset.catalogItem._id);
    if (!catalogItem) {
      return res.status(404).json({ message: "Catalog item not found." });
    }

    catalogItem.availableQuantity += 1;
    await catalogItem.save();

    issuedAsset.status = "Returned";
    issuedAsset.returnedAt = new Date();
    await issuedAsset.save();

    await History.create({
      item: catalogItem._id,
      action: "Returned",
      targetUser: issuedAsset.user,
      authorizedBy: req.user.userId,
      notes: notes ? `${issuedAsset.identifier} - ${notes}` : issuedAsset.identifier,
    });

    res.status(200).json({
      message: `Asset ${issuedAsset.identifier} returned.`,
      issuedAsset,
      catalogItem,
    });
  } catch (error) {
    console.error("Return Asset Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getIssuedAssets = async (req, res) => {
  try {
    const { userId, itemId, status } = req.query;
    
    let query = {};
    if (userId) query.user = userId;
    if (itemId) query.catalogItem = itemId;
    if (status) query.status = status;

    const issuedAssets = await IssuedAsset.find(query)
      .populate("user", "fullname instituteEmail role")
      .populate("catalogItem", "name category")
      .sort({ issuedAt: -1 });

    res.status(200).json({ issuedAssets });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getUserIssuedItems = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated." });
    }

    const issuedAssets = await IssuedAsset.find({ user: userId, status: "Issued" })
      .populate("catalogItem", "name category")
      .sort({ issuedAt: -1 });

    res.status(200).json({ issuedAssets });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getUserIssuedItemsById = async (req, res) => {
  try {
    const { userId } = req.params;

    const issuedAssets = await IssuedAsset.find({ user: userId, status: "Issued" })
      .populate("catalogItem", "name category")
      .populate("user", "fullname instituteEmail")
      .sort({ issuedAt: -1 });

    res.status(200).json({ issuedAssets });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getItemHistory = async (req, res) => {
  try {
    const { itemId } = req.params;
    const issuedAssets = await IssuedAsset.find({ catalogItem: itemId })
      .populate("user", "fullname instituteEmail")
      .sort({ issuedAt: -1 });
    
    res.status(200).json({ history: issuedAssets });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const item = await Item.findByIdAndDelete(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }
    res.status(200).json({ message: "Item deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const moveItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { newFolderId } = req.body;
    
    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ message: "Item not found." });
    
    item.folder = newFolderId || null;
    await item.save();

    res.status(200).json({ message: "Item moved successfully.", item });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createBulkItems = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Please provide an array of items." });
    }

    const formattedItems = items.map((item) => ({
      name: item.name,
      category: item.category || "General",
      description: item.description || "",
      totalQuantity: Number(item.totalQuantity) || 0,
      availableQuantity: Number(item.totalQuantity) || 0,
    }));

    const insertedItems = await Item.insertMany(formattedItems, { ordered: false });

    res.status(201).json({
      message: `Successfully added ${insertedItems.length} items to the catalog.`,
      count: insertedItems.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllIssued = async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = { status: "Issued" };
    if (search) {
      query.$or = [
        { identifier: { $regex: search, $options: "i" } },
        { "user.fullname": { $regex: search, $options: "i" } },
        { "user.instituteEmail": { $regex: search, $options: "i" } },
      ];
    }

    const issuedAssets = await IssuedAsset.find(query)
      .populate("user", "fullname instituteEmail role")
      .populate("catalogItem", "name category")
      .sort({ issuedAt: -1 });

    res.status(200).json({ issuedAssets });
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

    res.status(200).json({ message: "Action undone successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const bulkAssignFolder = async (req, res) => {
  try {
    const { folderId, userId } = req.body;
    res.status(400).json({ message: "Not implemented in stock model." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const bulkUnassignFolder = async (req, res) => {
  try {
    const { folderId } = req.body;
    res.status(400).json({ message: "Not implemented in stock model." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const assignAsset = async (req, res) => {
  try {
    const { userId, identifier, hardwareType } = req.body;

    if (!userId || !identifier || !hardwareType) {
      return res.status(400).json({ message: "User ID, hardware type, and identifier are required." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const catalogItem = await Item.findOne({ name: hardwareType });
    if (!catalogItem) {
      return res.status(404).json({ message: "Hardware type not found. Please select a valid hardware type." });
    }

    const existing = await IssuedAsset.findOne({ identifier, status: "Issued" });
    if (existing) {
      return res.status(400).json({ message: "This identifier is already issued to another user." });
    }

    if (catalogItem.availableQuantity <= 0) {
      return res.status(400).json({ message: "No available stock for this item." });
    }

    catalogItem.availableQuantity -= 1;
    await catalogItem.save();

    const issuedAsset = await IssuedAsset.create({
      user: userId,
      catalogItem: catalogItem._id,
      identifier,
      status: "Issued",
    });

    await History.create({
      item: catalogItem._id,
      action: "Assigned",
      targetUser: user._id,
      authorizedBy: req.user.userId,
      notes: `${identifier}`,
    });

    res.status(201).json({
      message: "Item assigned successfully.",
      issuedAsset,
      catalogItem,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};