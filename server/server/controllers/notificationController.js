const Notification = require("../models/Notification");

exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user.id,
    }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user.id,
    });
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    notification.isRead = true;
    await notification.save();
    res.status(200).json({ message: "Marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
