const Cart = require("../models/Cart.model");

exports.addToCart = async (req, res) => {
  const { product, flavor, quantity } = req.body;
  const userId = req.userId; 

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [{ product, flavor, quantity }]
    });
  } else {
    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === product && item.flavor === flavor
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product, flavor, quantity });
    }

    await cart.save();
  }

  res.json(cart);
};

/* Get user cart */
exports.getCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.userId }).populate("items.product");
  res.json(cart);
};

exports.removeFromCart = async (req, res) => {
  const { product, flavor } = req.body;

  const cart = await Cart.findOne({ user: req.userId });

  cart.items = cart.items.filter(
    item =>
      item.product.toString() !== product || item.flavor !== flavor
  );

  await cart.save();
  res.json(cart);
};
