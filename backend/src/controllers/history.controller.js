import { History } from "../models/History.js";

export const getItemHistory = async (req, res) => {
  try {
    const { itemId } = req.params;

    const history = await History.find({ item: itemId })
      .populate("targetUser", "fullname instituteEmail role")
      .populate("authorizedBy", "fullname role")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ count: history.length, history });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getLatestActivity = async (req, res) => {
  try {
    const logs = await History.find()
      .populate("item", "name identifier")
      .populate("targetUser", "fullname")
      .populate("authorizedBy", "fullname")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.status(200).json({ logs });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getGlobalAuditLog = async (req, res) => {
  try {
    const { fromDate, toDate, action } = req.query;

    const query = {};
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) {
        const toDateEnd = new Date(toDate);
        toDateEnd.setHours(23, 59, 59, 999);
        query.createdAt.$lte = toDateEnd;
      }
    }
    if (action) query.action = action;

    const logs = await History.find(query)
      .populate("item", "name identifier category")
      .populate("targetUser", "fullname instituteEmail branch studentId role")
      .populate("authorizedBy", "fullname")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      logs,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
