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
