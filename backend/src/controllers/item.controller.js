import { Item } from "../models/Item.js";
import { User } from "../models/User.js";

export const createItem = async (req, res) => {
  try {
    const { name, category, identifier } = req.body;
    const existingItem = await Item.findOne({ identifier });
    if (existingItem) {
      return res
        .status(400)
        .json({ message: "An item with this identifier already exists." });
    }

    const newItem = await Item.create({
      name,
      category,
      identifier,
      status: "Available",
    });

    res.status(201).json({
      message: "Item added to inventory successfully.",
      item: newItem,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllItems = async (req, res) => {
  try {
    const { status, category, search } = req.query;

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    let query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
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

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }

    if (item.status !== "Available") {
      return res.status(400).json({
        message: `Item cannot be assigned. Current status: ${item.status}`,
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Update the item
    item.assignedTo = user._id;
    item.status = "Assigned";
    await item.save();

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

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }

    if (item.status !== "Assigned") {
      return res
        .status(400)
        .json({ message: "This item is not currently assigned to anyone." });
    }

    item.assignedTo = null;
    item.status = "Available";
    await item.save();

    res.status(200).json({
      message: `${item.name} has been returned to the inventory.`,
      item,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createBulkItems = async (req, res) => {
  try {
    // Expects an array of items from the frontend
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Please provide an array of items." });
    }

    const identifiers = items.map((item) => item.identifier);
    const existingItems = await Item.find({ identifier: { $in: identifiers } });

    if (existingItems.length > 0) {
      const duplicates = existingItems
        .map((item) => item.identifier)
        .join(", ");
      return res.status(400).json({
        message: `Bulk upload failed. These identifiers already exist in the system: ${duplicates}`,
      });
    }

    const insertedItems = await Item.insertMany(items);

    res.status(201).json({
      message: `Successfully added ${insertedItems.length} items to the inventory.`,
      count: insertedItems.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
