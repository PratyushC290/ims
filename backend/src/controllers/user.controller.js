import { User } from "../models/User.js";
import { History } from "../models/History.js";

export const getAllUsers = async (req, res) => {
  try {
    const { search, role, status } = req.query;

    let query = {};

    if (role) query.role = role;
    if (status) query.accountStatus = status;

    if (search) {
      query.$or = [
        { fullname: { $regex: search, $options: "i" } },
        { instituteEmail: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("-__v -createdAt -updatedAt")
      .sort({ fullname: 1 })
      .lean();

    res.status(200).json({
      users,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if the requester is an admin or is requesting their own data
    if (
      req.user.userId !== userId &&
      !["Admin", "Super Admin"].includes(req.user.role)
    ) {
      return res.status(403).json({ message: "Access denied. You can only view your own profile." });
    }

    const user = await User.findById(userId).select("-__v");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const manuallyAddUser = async (req, res) => {
  try {
    const { fullname, instituteEmail, phoneNumber, role, studentId, branch, alternativeEmail, phdGuide } = req.body;

    if (!fullname || !instituteEmail || !phoneNumber || !role) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const validRoles = ["Student", "Faculty", "Staff", "Admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role selected." });
    }

    const existingEmail = await User.findOne({ instituteEmail: instituteEmail.toLowerCase() });
    
    if (existingEmail) {
      existingEmail.fullname = fullname;
      existingEmail.phoneNumber = phoneNumber;
      existingEmail.role = role;
      if (studentId !== undefined) existingEmail.studentId = studentId;
      if (branch !== undefined) existingEmail.branch = branch;
      if (alternativeEmail !== undefined) existingEmail.alternativeEmail = alternativeEmail;
      if (phdGuide !== undefined) existingEmail.phdGuide = phdGuide;
      await existingEmail.save();
      
      return res.status(200).json({
        message: `User ${fullname} has been updated successfully.`,
        user: {
          _id: existingEmail._id,
          fullname: existingEmail.fullname,
          instituteEmail: existingEmail.instituteEmail,
          role: existingEmail.role,
          accountStatus: existingEmail.accountStatus,
        },
      });
    }

    const existingPhone = await User.findOne({ phoneNumber });
    if (existingPhone) {
      return res.status(400).json({ message: "A user with this phone number already exists." });
    }

    const newUser = await User.create({
      fullname,
      instituteEmail: instituteEmail.toLowerCase(),
      phoneNumber,
      role,
      accountStatus: "Approved",
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullname)}&background=random`,
      studentId: studentId || "",
      branch: branch || "",
      alternativeEmail: alternativeEmail || "",
      phdGuide: phdGuide || "",
    });

    res.status(201).json({
      message: `User ${fullname} has been added successfully.`,
      user: {
        _id: newUser._id,
        fullname: newUser.fullname,
        instituteEmail: newUser.instituteEmail,
        role: newUser.role,
        accountStatus: newUser.accountStatus,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getUserHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if the requester is an admin or is requesting their own history
    if (
      req.user.userId !== userId &&
      !["Admin", "Super Admin"].includes(req.user.role)
    ) {
      return res.status(403).json({ message: "Access denied. You can only view your own history." });
    }

    let history = await History.find({ targetUser: userId })
      .populate("item", "name identifier")
      .populate("authorizedBy", "fullname")
      .sort({ createdAt: -1 })
      .lean();

    // Auto-patch missing itemName/itemIdentifier for existing records
    // This fixes "Unknown Asset" for items that still exist in the catalog
    const patchedHistory = await Promise.all(history.map(async (log) => {
      if ((!log.itemName || !log.itemIdentifier) && log.item) {
        const updates = {};
        if (!log.itemName) updates.itemName = log.item.name;
        if (!log.itemIdentifier) updates.itemIdentifier = log.notes?.split(" - ")[0] || log.item.identifier || "N/A";
        
        await History.updateOne({ _id: log._id }, { $set: updates });
        return { ...log, ...updates };
      }
      return log;
    }));

    res.status(200).json({ history: patchedHistory });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { fullname, phoneNumber, role, studentId, employeeId, branch, alternativeEmail, phdGuide } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (fullname) user.fullname = fullname;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (role) user.role = role;
    if (studentId !== undefined) user.studentId = studentId;
    if (employeeId !== undefined) user.employeeId = employeeId;
    if (branch !== undefined) user.branch = branch;
    if (alternativeEmail !== undefined) user.alternativeEmail = alternativeEmail;
    if (phdGuide !== undefined) user.phdGuide = phdGuide;

    await user.save();

    res.status(200).json({
      message: "User updated successfully.",
      user: {
        _id: user._id,
        fullname: user.fullname,
        instituteEmail: user.instituteEmail,
        phoneNumber: user.phoneNumber,
        role: user.role,
        accountStatus: user.accountStatus,
        studentId: user.studentId,
        employeeId: user.employeeId,
        branch: user.branch,
        alternativeEmail: user.alternativeEmail,
        phdGuide: user.phdGuide,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
