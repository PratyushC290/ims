import { User } from "../models/User.js";

export const getPendingRequests = async (req, res) => {
  try {
    const pendingUsers = await User.find({ accountStatus: "Pending" }).select(
      "-__v",
    );
    res.status(200).json({ count: pendingUsers.length, users: pendingUsers });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const reviewUserRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status update." });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.accountStatus = status;
    await user.save();

    //maybe use nodemailer here to email the user saying "You are approved!"

    res.status(200).json({
      message: `User ${user.fullname} has been ${status.toLowerCase()}.`,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.role = role;
    await user.save();

    res.status(200).json({ 
      message: `${user.fullname} is now a ${role} and can no longer log into the admin dashboard.` 
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};