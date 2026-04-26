import { Item } from "../models/Item.js";
import { User } from "../models/User.js";

export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalItems,
      availableItems,
      assignedItems,
      maintenanceItems,
      totalUsers,
      pendingAdminRequests,
      recentActivity,
    ] = await Promise.all([
      Item.countDocuments(),
      Item.countDocuments({ status: "Available" }),
      Item.countDocuments({ status: "Assigned" }),
      Item.countDocuments({ status: "Under Maintenance" }),

      User.countDocuments(),
      User.countDocuments({ accountStatus: "Pending" }),

      Item.find()
        .sort({ updatedAt: -1 })
        .limit(5)
        .populate("assignedTo", "fullname role")
        .populate("itemType", "name category thumbnail")
        .select("itemType identifier status updatedAt")
        .lean(),
    ]);

    res.status(200).json({
      inventoryOverview: {
        total: totalItems,
        available: availableItems,
        assigned: assignedItems,
        maintenance: maintenanceItems,
      },
      userOverview: {
        total: totalUsers,
        pendingRequests: pendingAdminRequests,
      },
      recentActivity,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
