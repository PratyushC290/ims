import { NoDuesVerification } from "../models/NoDuesVerification.js";
import { IssuedAsset } from "../models/IssuedAsset.js";
import { User } from "../models/User.js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendNoDuesNotificationEmail = async (
  student,
  verification,
  adminName,
) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.NO_DUES_NOTIFICATION_EMAIL,
    subject: `No Dues Certificate Generated - ${student.fullname}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="border: 2px solid #000; border-radius: 8px; padding: 24px;">
          <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 16px; margin-bottom: 20px;">
            <h2 style="margin: 0; color: #000;">Computer Centre, IIT Patna</h2>
            <h3 style="margin: 8px 0 0; color: #333;">No Dues Certificate</h3>
          </div>

          <p style="color: #666; text-align: right; margin-bottom: 16px;">
            Date: ${new Date(verification.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
          </p>

          <div style="margin-bottom: 20px;">
            <p style="margin: 8px 0;"><strong>Name:</strong> ${student.fullname}</p>
            <p style="margin: 8px 0;"><strong>Roll Number:</strong> ${student.studentId || "N/A"}</p>
            <p style="margin: 8px 0;"><strong>Institute Email:</strong> ${student.instituteEmail}</p>
            <p style="margin: 8px 0;"><strong>Department:</strong> ${student.branch || student.role || "N/A"}</p>
          </div>

          <div style="margin-bottom: 20px;">
            <p style="line-height: 1.6;">
              This is to certify that <strong>${student.fullname}</strong> has returned all issued hardware 
              and has no pending dues towards the department. All items assigned to this student have been properly 
              accounted for and returned in good condition.
            </p>
          </div>

          <div style="border-top: 2px solid #000; padding-top: 20px; margin-top: 24px;">
            <p style="margin: 8px 0;"><strong>Verification Status:</strong> ${verification.status}</p>
            <p style="margin: 8px 0;"><strong>Digitally Signed by:</strong> ${adminName}</p>
            <p style="margin: 8px 0;"><strong>Verification Date:</strong> ${new Date(verification.createdAt).toLocaleDateString("en-GB").replace(/\//g, "-")}</p>
            <p style="margin: 8px 0;"><strong>Verification Time:</strong> ${new Date(verification.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}</p>
          </div>

          <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #ccc; text-align: center;">
            <p style="color: #888; font-size: 12px; margin: 0;">
              Computer Centre, IIT Patna | Generated on ${new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const verifyNoDues = async (req, res) => {
  try {
    const { studentId, returnedItems } = req.body;

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

    const returnedItemsAtVerification = (returnedItems || []).map((item) => ({
      itemName: item.catalogItem?.name || item.itemName || "Unknown",
      itemId: item.catalogItem?._id || item.itemId,
      identifier: item.identifier,
    }));

    const verification = new NoDuesVerification({
      student: studentId,
      verifiedBy: req.user.userId,
      itemsAtVerification,
      returnedItemsAtVerification,
      pendingCount: issuedItems.length,
      status: issuedItems.length === 0 ? "Cleared" : "Pending",
    });

    await verification.save();

    const admin = await User.findById(req.user.userId);
    const adminName = admin?.fullname || "Admin";

    if (process.env.NO_DUES_NOTIFICATION_EMAIL) {
      sendNoDuesNotificationEmail(student, verification, adminName).catch(
        (err) => {
          console.error("Failed to send NoDues notification email:", err);
        },
      );
    }

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

    let verifications = await NoDuesVerification.find(query)
      .populate("student", "fullname instituteEmail role")
      .populate("verifiedBy", "fullname")
      .sort({ createdAt: -1 })
      .lean();

    if (search) {
      const searchLower = search.toLowerCase();
      verifications = verifications.filter(
        (v) =>
          v.student?.fullname?.toLowerCase().includes(searchLower) ||
          v.student?.instituteEmail?.toLowerCase().includes(searchLower),
      );
    }

    res.status(200).json({
      verifications,
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
