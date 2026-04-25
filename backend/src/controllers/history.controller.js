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
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [logs, totalLogs] = await Promise.all([
      History.find()
        .populate("item", "name identifier category")
        .populate("targetUser", "fullname role")
        .populate("authorizedBy", "fullname")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      History.countDocuments(),
    ]);

    res.status(200).json({
      logs,
      pagination: {
        totalLogs,
        totalPages: Math.ceil(totalLogs / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
