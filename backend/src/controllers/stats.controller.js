import { Item } from "../models/Item.js";
import { User } from "../models/User.js";
import { Request } from "../models/Request.js";
import { IssuedAsset } from "../models/IssuedAsset.js";

export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalItems,
      availableItems,
      issuedItems,
      totalUsers,
      pendingAdminRequests,
      pendingHardwareRequests,
      recentIssued,
    ] = await Promise.all([
      Item.countDocuments(),
      Item.aggregate([
        { $group: { _id: null, total: { $sum: "$availableQuantity" } } }
      ]),
      IssuedAsset.countDocuments({ status: "Issued" }),
      User.countDocuments(),
      User.countDocuments({ accountStatus: "Pending" }),
      Request.countDocuments({ status: "Pending" }),
      IssuedAsset.find()
        .sort({ issuedAt: -1 })
        .limit(5)
        .populate("user", "fullname role")
        .populate("catalogItem", "name")
        .lean(),
    ]);

    const totalAvailable = totalItems > 0 
      ? availableItems[0]?.total || 0 
      : 0;

    res.status(200).json({
      inventoryOverview: {
        total: totalItems,
        available: totalAvailable,
        assigned: issuedItems,
        maintenance: 0,
      },
      userOverview: {
        total: totalUsers,
        pendingRequests: pendingAdminRequests,
      },
      requestsOverview: {
        pendingHardware: pendingHardwareRequests,
        pendingAdmin: pendingAdminRequests,
      },
      recentActivity: recentIssued,
    });
  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};