const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }
      req.user.id = req.user._id.toString();

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

exports.vendor = (req, res, next) => {
  if (req.user && req.user.role === "vendor") {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as a vendor" });
  }
};

exports.vendorOnly = (req, res, next) => {
  if (req.user && req.user.role === "vendor") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Vendor role required." });
  }
};

exports.customerOnly = (req, res, next) => {
  if (req.user && req.user.role === "customer") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Customer role required." });
  }
};

exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admin role required." });
  }
};

exports.vendorOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === "vendor" || req.user.role === "admin")) {
    next();
  } else {
    res
      .status(403)
      .json({ message: "Access denied. Vendor or Admin role required." });
  }
};

exports.checkResourceOwnership = (resourceModel, resourceField = "vendor") => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id;
      const resource = await resourceModel.findById(resourceId);

      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }

      // Admin can access any resource
      if (req.user.role === "admin") {
        req.resource = resource;
        return next();
      }

      // Check if user owns the resource
      if (resource[resourceField].toString() !== req.user.id) {
        return res
          .status(403)
          .json({ message: "Access denied. You don't own this resource." });
      }

      req.resource = resource;
      next();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
};
