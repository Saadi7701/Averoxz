const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { createVendorStore } = require("./vendorController");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "24h" });
};

exports.registerUser = async (req, res) => {
  const { username, email, password, role, vendorInfo, customerInfo } =
    req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const userData = {
      username,
      email,
      password,
      role: role || "customer",
    };

    if (role === "vendor") {
      if (
        !vendorInfo?.storeName ||
        !vendorInfo?.storeDescription ||
        !vendorInfo?.businessAddress ||
        !vendorInfo?.phoneNumber
      ) {
        return res
          .status(400)
          .json({ message: "Vendor information is required" });
      }
      userData.vendorInfo = vendorInfo;
    }

    if (role === "customer" && customerInfo) {
      userData.customerInfo = customerInfo;
    }

    const user = await User.create(userData);

    if (user.role === "vendor") {
      await createVendorStore(user, vendorInfo);
    }

    const responseData = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    };

    if (user.vendorInfo) {
      responseData.vendorInfo = user.vendorInfo;
    }

    if (user.customerInfo) {
      responseData.customerInfo = user.customerInfo;
    }

    res.status(201).json(responseData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      const responseData = {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      };

      if (user.vendorInfo) {
        responseData.vendorInfo = user.vendorInfo;
      }

      if (user.customerInfo) {
        responseData.customerInfo = user.customerInfo;
      }

      res.json(responseData);
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { username, email, vendorInfo, customerInfo } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (username) user.username = username;
    if (email) user.email = email;

    if (user.role === "vendor" && vendorInfo) {
      user.vendorInfo = { ...user.vendorInfo, ...vendorInfo };
    }

    if (customerInfo) {
      user.customerInfo = { ...user.customerInfo, ...customerInfo };
    }

    user.updatedAt = Date.now();

    const updatedUser = await user.save();

    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    res.json(userResponse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    user.updatedAt = Date.now();
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
