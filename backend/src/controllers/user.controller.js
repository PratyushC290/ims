import { User } from "../models/User.js";

export const getAllUsers = async (req, res) => {
  try {
    const {
      search,
      role,
      status,
      limit: queryLimit,
      page: queryPage,
    } = req.query;

    const page = Math.max(1, Number(queryPage) || 1);
    const limit = Math.min(50, Math.max(1, Number(queryLimit) || 20));
    const skip = (page - 1) * limit;

    let query = {};

    if (role) query.role = role;
    if (status) query.accountStatus = status;

    if (search) {
      query.$or = [
        { fullname: { $regex: search, $options: "i" } },
        { instituteEmail: { $regex: search, $options: "i" } },
      ];
    }

    const [users, totalUsers] = await Promise.all([
      User.find(query)
        .select("-__v -createdAt -updatedAt")
        .sort({ fullname: 1 })
        .skip(skip)
        .limit(limit)
        .lean(), 
      User.countDocuments(query),
    ]);

    res.status(200).json({
      users,
      pagination: {
        totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
        currentPage: page,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
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
    const { fullname, instituteEmail, phoneNumber, role } = req.body;

    if (!fullname || !instituteEmail || !phoneNumber || !role) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const validRoles = ["Student", "Faculty", "Staff", "Admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role selected." });
    }

    const existingEmail = await User.findOne({ instituteEmail: instituteEmail.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ message: "A user with this email already exists." });
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
