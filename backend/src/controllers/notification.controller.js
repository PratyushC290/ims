import { Notification } from "../models/Notification.js";
import { User } from "../models/User.js";
import { Item } from "../models/Item.js";

export const getNotifications = async (req, res) => {
  try {
    const recipientId = req.user.id;
    
    const notifications = await Notification.find({ recipient: recipientId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const unreadCount = await Notification.countDocuments({
      recipient: recipientId,
      isRead: false,
    });

    res.status(200).json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const recipientId = req.user.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: recipientId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found." });
    }

    res.status(200).json({ message: "Notification marked as read." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const recipientId = req.user.id;

    await Notification.updateMany(
      { recipient: recipientId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ message: "All notifications marked as read." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createNotification = async (data) => {
  try {
    const notification = new Notification(data);
    await notification.save();
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};

export const notifyPendingApprovals = async (adminId) => {
  try {
    const pendingCount = await User.countDocuments({ accountStatus: "Pending" });
    
    if (pendingCount > 0) {
      await Notification.findOneAndUpdate(
        { recipient: adminId, type: "pendingUser", isRead: false },
        {
          recipient: adminId,
          type: "pendingUser",
          title: "Pending User Approvals",
          message: `${pendingCount} user ${pendingCount === 1 ? "request" : "requests"} waiting for approval.`,
          relatedModel: "User",
        },
        { upsert: true, new: true }
      );
    }
  } catch (error) {
    console.error("Error notifying pending approvals:", error);
  }
};

export const notifyMaintenanceAlerts = async (adminId) => {
  try {
    const maintenanceCount = await Item.countDocuments({ status: "Under Maintenance" });
    
    if (maintenanceCount > 0) {
      await Notification.findOneAndUpdate(
        { recipient: adminId, type: "maintenanceAlert", isRead: false },
        {
          recipient: adminId,
          type: "maintenanceAlert",
          title: "Maintenance Alert",
          message: `${maintenanceCount} item${maintenanceCount === 1 ? " is" : "s are"} currently under maintenance.`,
          relatedModel: "Item",
        },
        { upsert: true, new: true }
      );
    }
  } catch (error) {
    console.error("Error notifying maintenance alerts:", error);
  }
};

export const seedNotifications = async () => {
  try {
    const admins = await User.find({ role: { $in: ["Admin", "Super Admin"] } });
    
    for (const admin of admins) {
      await notifyPendingApprovals(admin._id);
      await notifyMaintenanceAlerts(admin._id);
    }
  } catch (error) {
    console.error("Error seeding notifications:", error);
  }
};