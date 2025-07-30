const Category = require("../models/Category");
const Product = require("../models/Product");

// Get all categories (public)
exports.getCategories = async (req, res) => {
  try {
    const { includeInactive = false, parentOnly = false } = req.query;

    const query = {};
    if (!includeInactive) {
      query.isActive = true;
    }
    if (parentOnly) {
      query.parent = null;
    }

    const categories = await Category.find(query)
      .populate("children", "name slug")
      .sort({ sortOrder: 1, name: 1 });

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get category by ID or slug (public)
exports.getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({ slug, isActive: true })
      .populate("parent", "name slug")
      .populate("children", "name slug");

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Get category products count
    const productCount = await Product.countDocuments({
      category: category._id,
      status: "active",
    });

    res.json({
      ...category.toObject(),
      productCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create category (admin only)
exports.createCategory = async (req, res) => {
  try {
    const { name, description, image, parent, sortOrder } = req.body;

    // Check if category name already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: "Category name already exists" });
    }

    let level = 0;
    if (parent) {
      const parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        return res.status(400).json({ message: "Parent category not found" });
      }
      level = parentCategory.level + 1;
    }

    const category = new Category({
      name,
      description: description || "",
      image: image || "",
      parent: parent || null,
      level,
      sortOrder: sortOrder || 0,
    });

    const createdCategory = await category.save();

    // Update parent's children array if this is a subcategory
    if (parent) {
      await Category.findByIdAndUpdate(parent, {
        $push: { children: createdCategory._id },
      });
    }

    const populatedCategory = await Category.findById(createdCategory._id)
      .populate("parent", "name slug")
      .populate("children", "name slug");

    res.status(201).json(populatedCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update category (admin only)
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image, parent, sortOrder, isActive } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if new name conflicts with existing categories
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({
        name,
        _id: { $ne: id },
      });
      if (existingCategory) {
        return res
          .status(400)
          .json({ message: "Category name already exists" });
      }
    }

    // Update fields
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (sortOrder !== undefined) category.sortOrder = sortOrder;
    if (isActive !== undefined) category.isActive = isActive;

    // Handle parent change
    if (parent !== undefined) {
      const oldParent = category.parent;

      if (parent) {
        const parentCategory = await Category.findById(parent);
        if (!parentCategory) {
          return res.status(400).json({ message: "Parent category not found" });
        }
        category.parent = parent;
        category.level = parentCategory.level + 1;

        // Add to new parent's children
        await Category.findByIdAndUpdate(parent, {
          $addToSet: { children: category._id },
        });
      } else {
        category.parent = null;
        category.level = 0;
      }

      // Remove from old parent's children
      if (oldParent) {
        await Category.findByIdAndUpdate(oldParent, {
          $pull: { children: category._id },
        });
      }
    }

    const updatedCategory = await category.save();

    const populatedCategory = await Category.findById(updatedCategory._id)
      .populate("parent", "name slug")
      .populate("children", "name slug");

    res.json(populatedCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete category (admin only)
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if category has products
    const productCount = await Product.countDocuments({ category: id });
    if (productCount > 0) {
      return res.status(400).json({
        message:
          "Cannot delete category with existing products. Please move or delete products first.",
      });
    }

    // Check if category has subcategories
    if (category.children.length > 0) {
      return res.status(400).json({
        message:
          "Cannot delete category with subcategories. Please delete subcategories first.",
      });
    }

    // Remove from parent's children array
    if (category.parent) {
      await Category.findByIdAndUpdate(category.parent, {
        $pull: { children: category._id },
      });
    }

    await Category.findByIdAndDelete(id);

    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get category hierarchy (public)
exports.getCategoryHierarchy = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({
      level: 1,
      sortOrder: 1,
      name: 1,
    });

    // Build hierarchy
    const categoryMap = {};
    const rootCategories = [];

    // First pass: create map
    categories.forEach((cat) => {
      categoryMap[cat._id] = {
        ...cat.toObject(),
        children: [],
      };
    });

    // Second pass: build hierarchy
    categories.forEach((cat) => {
      if (cat.parent) {
        if (categoryMap[cat.parent]) {
          categoryMap[cat.parent].children.push(categoryMap[cat._id]);
        }
      } else {
        rootCategories.push(categoryMap[cat._id]);
      }
    });

    res.json(rootCategories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update product counts for all categories
exports.updateProductCounts = async (req, res) => {
  try {
    const categories = await Category.find({});

    for (const category of categories) {
      const productCount = await Product.countDocuments({
        category: category._id,
        status: "active",
      });

      category.productCount = productCount;
      await category.save();
    }

    res.json({ message: "Product counts updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
