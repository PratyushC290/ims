import { Item } from "../models/Item.js";
import { User } from "../models/User.js";

export const createItem = async (req, res) => {
  try {
    const { name, category, identifier } = req.body;
    const newItem = await Item.create({
      name,
      category,
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
    const { status, category, search } = req.query;

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    let query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.$text = { $search: search };
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

    const item = await Item.findOneAndUpdate(
      { _id: itemId, status: "Assigned" },
      { status: "Available", assignedTo: null },
      { new: true },
    );

    if (!item) {
      return res.status(400).json({
        message:
          "Item cannot be returned. It is not currently assigned to anyone.",
      });
    }

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
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Please provide an array of items." });
    }

    const formattedItems = items.map((item) => ({
      name: item.name,
      category: item.category,
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
