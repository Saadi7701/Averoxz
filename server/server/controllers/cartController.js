const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id })
      .populate({
        path: 'items.product',
        populate: {
          path: 'vendor store category',
          select: 'username name'
        }
      });
    
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }
    
    // Filter out items with deleted products
    const validItems = cart.items.filter(item => item.product);
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    // Validate product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    if (product.status !== 'active') {
      return res.status(400).json({ message: "Product is not available" });
    }
    
    // Check inventory
    if (product.inventory.trackInventory && product.inventory.quantity < quantity) {
      return res.status(400).json({ 
        message: `Only ${product.inventory.quantity} items available in stock` 
      });
    }
    
    // Get or create cart
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }
    
    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );
    
    if (existingItemIndex > -1) {
      // Update quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      
      // Check inventory for new quantity
      if (product.inventory.trackInventory && product.inventory.quantity < newQuantity) {
        return res.status(400).json({ 
          message: `Only ${product.inventory.quantity} items available in stock` 
        });
      }
      
      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].price = product.price; // Update price
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity,
        price: product.price
      });
    }
    
    await cart.save();
    
    // Populate cart for response
    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        populate: {
          path: 'vendor store category',
          select: 'username name'
        }
      });
    
    res.json({
      message: "Item added to cart successfully",
      cart: populatedCart
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }
    
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    
    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }
    
    // Validate product and inventory
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    if (product.inventory.trackInventory && product.inventory.quantity < quantity) {
      return res.status(400).json({ 
        message: `Only ${product.inventory.quantity} items available in stock` 
      });
    }
    
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].price = product.price; // Update price
    
    await cart.save();
    
    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        populate: {
          path: 'vendor store category',
          select: 'username name'
        }
      });
    
    res.json({
      message: "Cart updated successfully",
      cart: populatedCart
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    
    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    );
    
    await cart.save();
    
    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        populate: {
          path: 'vendor store category',
          select: 'username name'
        }
      });
    
    res.json({
      message: "Item removed from cart successfully",
      cart: populatedCart
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    
    cart.items = [];
    await cart.save();
    
    res.json({
      message: "Cart cleared successfully",
      cart
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get cart count
exports.getCartCount = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    const count = cart ? cart.totalItems : 0;
    
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Validate cart before checkout
exports.validateCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }
    
    const validationErrors = [];
    const validItems = [];
    
    for (const item of cart.items) {
      if (!item.product) {
        validationErrors.push(`Product no longer exists`);
        continue;
      }
      
      if (item.product.status !== 'active') {
        validationErrors.push(`${item.product.name} is no longer available`);
        continue;
      }
      
      if (item.product.inventory.trackInventory && 
          item.product.inventory.quantity < item.quantity) {
        validationErrors.push(
          `Only ${item.product.inventory.quantity} of ${item.product.name} available`
        );
        continue;
      }
      
      // Check if price has changed
      if (item.price !== item.product.price) {
        validationErrors.push(
          `Price of ${item.product.name} has changed from $${item.price} to $${item.product.price}`
        );
        // Update price in cart
        item.price = item.product.price;
      }
      
      validItems.push(item);
    }
    
    // Update cart with valid items and new prices
    cart.items = validItems;
    await cart.save();
    
    res.json({
      isValid: validationErrors.length === 0,
      errors: validationErrors,
      cart
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

