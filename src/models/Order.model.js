const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product"
        },
        name: String,
        flavor: String,
        price: Number,
        quantity: Number
      }
    ],

    amount: {
      type: Number,
      required: true
    },

    status: {
      type: String,
      enum: ["Pending", "Paid", "Shipped", "Delivered", "Cancelled"],
      default: "Pending"
    },

    payment: {
      type: String,
      enum: ["COD", "UPI", "Paid"],
      required: true
    },

    upiId: {
      type: String,
      default: null
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
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
