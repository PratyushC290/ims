import { ItemType } from "../models/ItemType.js";
import { Item } from "../models/Item.js";
import { History } from "../models/History.js";

export const createItemType = async (req, res) => {
  try {
    const { name, category, description, thumbnail } = req.body;
    
    const existing = await ItemType.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "An Item Type with this name already exists." });
    }

    const newItemType = await ItemType.create({
      name,
      category,
      description,
      thumbnail: thumbnail || "",
    });

    res.status(201).json({
      message: "Item Type created successfully.",
      itemType: newItemType,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllItemTypes = async (req, res) => {
  try {
    const itemTypes = await ItemType.find().lean();
    
    // Fetch counts for each itemType
    // Available count, Assigned count, total count
    const stats = await Item.aggregate([
      {
        $group: {
          _id: { itemType: "$itemType", status: "$status" },
          count: { $sum: 1 }
        }
      }
    ]);

    // Map stats
    const statsMap = {};
    stats.forEach(stat => {
      if (!stat._id.itemType) return;
      const typeId = stat._id.itemType.toString();
      if (!statsMap[typeId]) statsMap[typeId] = { available: 0, assigned: 0, maintenance: 0, total: 0 };
      
      statsMap[typeId].total += stat.count;
      if (stat._id.status === "Available") statsMap[typeId].available += stat.count;
      else if (stat._id.status === "Assigned") statsMap[typeId].assigned += stat.count;
      else if (stat._id.status === "Under Maintenance") statsMap[typeId].maintenance += stat.count;
    });

    const enrichedItemTypes = itemTypes.map(type => ({
      ...type,
      stats: statsMap[type._id.toString()] || { available: 0, assigned: 0, maintenance: 0, total: 0 }
    }));

    res.status(200).json({
      itemTypes: enrichedItemTypes
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteItemType = async (req, res) => {
  try {
    const { id } = req.params;
    
    const itemType = await ItemType.findById(id);
    if (!itemType) return res.status(404).json({ message: "Item Type not found" });

    // Delete all associated items and history
    const items = await Item.find({ itemType: id });
    const itemIds = items.map(item => item._id);

    await History.deleteMany({ item: { $in: itemIds } });
    await Item.deleteMany({ itemType: id });
    await ItemType.findByIdAndDelete(id);

    res.status(200).json({ message: "Item Type and all its items deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
