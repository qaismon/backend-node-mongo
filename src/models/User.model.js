const mongoose = require("mongoose");

/* ---------- Order Item Schema (for future use) ---------- */
const orderItemSchema = new mongoose.Schema(
  {
    id: String,        // product id (string)
    name: String,
    flavor: String,
    price: Number,
    quantity: Number
  },
  { _id: false }
);

/* ---------- Order Schema (orders array exists, currently empty) ---------- */
const orderSchema = new mongoose.Schema(
  {
    id: String,
    items: [orderItemSchema],
    amount: Number,
    status: {
      type: String,
      enum: ["Pending", "Shipped", "Delivered", "Cancelled"]
    },
    date: String,
    payment: {
      type: String,
      enum: ["COD", "UPI"]
    },
    deliveryData: {
      firstName: String,
      lastName: String,
      email: String,
      street: String,
      city: String,
      zipcode: String,
      country: String,
      phone: String
    },
    upiId: {
      type: String,
      default: null
    }
  },
  { _id: false }
);

/* ---------- User Schema ---------- */
const userSchema = new mongoose.Schema(
  {
    // OLD JSON id (optional but useful during migration)
    legacyId: {
      type: String
    },

    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    password: {
      type: String,
      required: true
    },

    // Cart stored exactly like JSON
    // example:
    // {
    //   "aaaaa": { "Vanilla": 1 }
    // }
    cart: {
      type: Object,
      default: {}
    },

    orders: {
      type: [orderSchema],
      default: []
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },

    defaultAddress: {
      type: {
        firstName: String,
        lastName: String,
        email: String,
        street: String,
        city: String,
        zipcode: String,
        country: String,
        phone: String
      },
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
