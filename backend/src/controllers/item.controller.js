import { Item } from "../models/Item.js";
import { IssuedAsset } from "../models/IssuedAsset.js";
import { User } from "../models/User.js";
import { History } from "../models/History.js";
import { ActionLog } from "../models/ActionLog.js";
import { uploadToGridFS, streamFromGridFS } from "../config/gridfs.js";

export const createItem = async (req, res) => {
  try {
    const { name, category, description, totalQuantity } = req.body;

    if (!name || !totalQuantity) {
      return res.status(400).json({ message: "Name and total quantity are required." });
    }

    let documentFileId = null;
    if (req.file) {
      documentFileId = await uploadToGridFS(req.file);
    }

    const newItem = await Item.create({
      name,
      category: category || "General",
      description: description || "",
      totalQuantity: Number(totalQuantity),
      availableQuantity: Number(totalQuantity),
      documentFileId,
    });

    res.status(201).json({
      message: "Item added to catalog successfully.",
      item: newItem,
    });
  } catch (error) {
    console.error("CreateItem Error:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message,
      stack: error.stack,
      code: error.code,
      keyPattern: error.keyPattern
    });
  }
};

export const getAllItems = async (req, res) => {
  try {
    const { status, category, search } = req.query;

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

    const items = await Item.find(query)
      .sort({ createdAt: -1 });

    res.status(200).json({
      items,
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
      itemName: catalogItem.name,
      itemIdentifier: identifier,
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
      itemName: catalogItem.name,
      itemIdentifier: issuedAsset.identifier,
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

export const returnAllAssets = async (req, res) => {
  try {
    const { userId } = req.params;
    const notes = req.body?.notes || "Returned all via No Dues";

    const issuedAssets = await IssuedAsset.find({ user: userId, status: "Issued" }).populate("catalogItem");
    
    if (issuedAssets.length === 0) {
      return res.status(400).json({ message: "No issued assets found for this user." });
    }

    const returnedItemsList = [];

    for (const issuedAsset of issuedAssets) {
      const catalogItem = await Item.findById(issuedAsset.catalogItem._id);
      if (catalogItem) {
        catalogItem.availableQuantity += 1;
        await catalogItem.save();
      }

      issuedAsset.status = "Returned";
      issuedAsset.returnedAt = new Date();
      await issuedAsset.save();

      await History.create({
        item: issuedAsset.catalogItem._id,
        itemName: catalogItem ? catalogItem.name : "Deleted Asset",
        itemIdentifier: issuedAsset.identifier,
        action: "Returned",
        targetUser: issuedAsset.user,
        authorizedBy: req.user.userId,
        notes: `${issuedAsset.identifier} - ${notes}`,
      });

      // To make it easy to display in the certificate, add catalogItem details
      returnedItemsList.push({
        ...issuedAsset.toObject(),
        catalogItem: catalogItem ? catalogItem.toObject() : issuedAsset.catalogItem
      });
    }

    res.status(200).json({
      message: `All ${issuedAssets.length} assets returned successfully.`,
      returnedAssets: returnedItemsList,
    });
  } catch (error) {
    console.error("Return All Assets Error:", error);
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
    const item = await Item.findById(itemId);
    
    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }

    // Preserve item details in history before deletion
    await History.updateMany(
      { item: itemId },
      { 
        $set: { 
          itemName: item.name,
          // If itemIdentifier is missing, we try to use a generic one or leave it to notes
        } 
      }
    );

    await Item.findByIdAndDelete(itemId);
    res.status(200).json({ message: "Item deleted successfully." });
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
    const { userId, items, identifier, hardwareType } = req.body;

    // Support both legacy format (single item) and new format (array)
    const isLegacyFormat = !items || !Array.isArray(items);
    
    if (isLegacyFormat) {
      // Legacy single-item format for backward compatibility
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
        itemName: catalogItem.name,
        itemIdentifier: identifier,
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
      return;
    }

    // New array format - multiple items in one operation
    if (isLegacyFormat) {
      // ... (keep the existing legacy format)
    }

    // New array format - multiple items in one operation
    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "User ID and items array are required." });
    }

    console.log("assignAsset received:", { userId, items });

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Validation Phase - check all items before processing any
    const validations = [];
    for (const item of items) {
      if (!item.hardwareType || !item.quantity || item.quantity < 1) {
        return res.status(400).json({ message: "Each item must have a hardware type and quantity >= 1." });
      }

      // Prefer itemId if provided, otherwise fallback to name lookup
      let catalogItem;
      console.log("Lookup:", item.hardwareType, "itemId:", item.itemId);
      if (item.itemId) {
        catalogItem = await Item.findById(item.itemId);
      } else {
        catalogItem = await Item.findOne({ name: item.hardwareType });
      }
      
      if (!catalogItem) {
        return res.status(404).json({ message: item.itemId 
          ? `Item not found.` 
          : `Hardware type '${item.hardwareType}' not found.` 
        });
      }

      if (catalogItem.availableQuantity < item.quantity) {
        return res.status(400).json({ message: `Not enough stock for '${catalogItem.name}'. Available: ${catalogItem.availableQuantity}` });
      }

      // Identifiers are mandatory
      const providedIds = item.identifiers || [];
      
      if (providedIds.length === 0 || providedIds.length !== item.quantity) {
        console.log("FAIL:", item.hardwareType, "qty:", item.quantity, "ids len:", providedIds.length);
        return res.status(400).json({ message: `Must provide exactly ${item.quantity} identifier(s) for ${catalogItem.name}.` });
      }

      for (const id of providedIds) {
        if (!id.trim()) {
          return res.status(400).json({ message: "Identifier cannot be empty." });
        }
        const existing = await IssuedAsset.findOne({ identifier: id.trim(), status: "Issued" });
        if (existing) {
          return res.status(400).json({ message: `Identifier '${id.trim()}' is already issued.` });
        }
      }

      validations.push({ catalogItem, quantity: item.quantity, identifiers: providedIds });
    }

    // Execution Phase - process all items
    const newIssuedAssets = [];
    const historyLogs = [];

    for (const validation of validations) {
      const { catalogItem, quantity, identifiers } = validation;

      // Deduct stock
      catalogItem.availableQuantity -= quantity;
      await catalogItem.save();

      // Create issued assets
      for (let i = 0; i < quantity; i++) {
        const identifier = identifiers[i].trim();
        
        const issuedAsset = await IssuedAsset.create({
          user: userId,
          catalogItem: catalogItem._id,
          identifier,
          status: "Issued",
        });

        newIssuedAssets.push(issuedAsset);

        historyLogs.push({
          item: catalogItem._id,
          itemName: catalogItem.name,
          itemIdentifier: identifier,
          action: "Assigned",
          targetUser: user._id,
          authorizedBy: req.user.userId,
          notes: `${identifier}`,
        });
      }
    }

    if (historyLogs.length > 0) {
      await History.insertMany(historyLogs);
    }

    res.status(201).json({
      message: `${newIssuedAssets.length} item(s) assigned successfully.`,
      issuedAssets: newIssuedAssets,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const attachItemDocument = async (req, res) => {
  try {
    const { itemId } = req.params;
    if (!req.file) {
      return res.status(400).json({ message: "No document provided." });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }

    const fileId = await uploadToGridFS(req.file);
    item.documentFileId = fileId;
    await item.save();

    res.status(200).json({
      message: "Document attached successfully.",
      item,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const streamItemDocument = async (req, res) => {
  try {
    const { itemId } = req.params;
    const item = await Item.findById(itemId);

    if (!item || !item.documentFileId) {
      return res.status(404).json({ message: "Document not found." });
    }

    res.set("Content-Type", "application/pdf");
    streamFromGridFS(item.documentFileId, res);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};