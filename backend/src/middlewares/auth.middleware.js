import jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res
        .status(401)
        .json({ message: "Not authorized. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    res
      .status(401)
      .json({ message: "Not authorized. Token failed or expired." });
  }
};

export const superAdminOnly = (req, res, next) => {
  if (req.user && req.user.role === "Super Admin") {
    next();
  } else {
    res
      .status(403)
      .json({ message: "Access Denied. Super Admin privileges required." });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && ["Admin", "Super Admin"].includes(req.user.role)) {
    next();
  } else {
    res
      .status(403)
      .json({ message: "Access Denied. Admin privileges required." });
  }
};
