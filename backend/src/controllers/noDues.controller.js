import { NoDuesVerification } from "../models/NoDuesVerification.js";
import { IssuedAsset } from "../models/IssuedAsset.js";
import { User } from "../models/User.js";

export const verifyNoDues = async (req, res) => {
  try {
    const { studentId } = req.body;

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const existing = await NoDuesVerification.findOne({ student: studentId });
    if (existing) {
      await NoDuesVerification.deleteOne({ _id: existing._id });
    }

    const issuedItems = await IssuedAsset.find({
      user: studentId,
      status: "Issued",
    }).populate("catalogItem");

    const itemsAtVerification = issuedItems.map((item) => ({
      itemName: item.catalogItem?.name || "Unknown",
      itemId: item.catalogItem?._id,
      identifier: item.identifier,
      status: item.status,
    }));

    const verification = new NoDuesVerification({
      student: studentId,
      verifiedBy: req.user.userId,
      itemsAtVerification,
      pendingCount: issuedItems.length,
      status: issuedItems.length === 0 ? "Cleared" : "Pending",
    });

    await verification.save();

    res.status(201).json({
      message: "Verification saved",
      verification: {
        _id: verification._id,
        student: student.fullname,
        status: verification.status,
        pendingCount: verification.pendingCount,
        verifiedAt: verification.createdAt,
      },
    });
  } catch (error) {
    console.error("NoDues Verify Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getNoDuesVerifications = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const { search, fromDate, toDate } = req.query;

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

    const [verifications, total] = await Promise.all([
      NoDuesVerification.find(query)
        .populate("student", "fullname instituteEmail")
        .populate("verifiedBy", "fullname")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      NoDuesVerification.countDocuments(query),
    ]);

    let filteredVerifications = verifications;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredVerifications = verifications.filter(
        (v) =>
          v.student?.fullname?.toLowerCase().includes(searchLower) ||
          v.student?.instituteEmail?.toLowerCase().includes(searchLower)
      );
    }

    res.status(200).json({
      verifications: filteredVerifications,
      pagination: {
        totalVerifications: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    console.error("Get NoDues Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteNoDuesVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const verification = await NoDuesVerification.findById(id);
    if (!verification) {
      return res.status(404).json({ message: "Verification not found" });
    }
    await NoDuesVerification.deleteOne({ _id: id });
    res.status(200).json({ message: "Verification deleted" });
  } catch (error) {
    console.error("Delete NoDues Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};