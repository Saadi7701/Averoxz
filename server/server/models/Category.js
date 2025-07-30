const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    level: { type: Number, default: 0 },
    sortOrder: { type: Number, default: 0 },
    productCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }, // optional: legacy
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
