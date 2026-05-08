const mongoose = require('mongoose');

const MEALS = [
  { name: 'BOURAK ANABI', price: 5000 },
  { name: 'HARIRA', price: 4000 },
  { name: 'KARANTIKA', price: 15000 },
  { name: 'MAKODA', price: 7500 },
  { name: 'MHAJEB', price: 9000 },
  { name: 'ZFETY', price: 2000 },
];

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    customerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    meal: {
      type: String,
      required: true,
      enum: MEALS.map((m) => m.name),
    },
    quantity: { type: Number, required: true, min: 1, max: 20, default: 1 },
    deliveryTime: { type: String, required: true },
    totalPrice: { type: Number },
    status: {
      type: String,
      enum: ['Pending', 'Preparing', 'On Delivery', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

// Auto-generate order number and total price
orderSchema.pre('save', async function (next) {
  if (this.isNew) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `A1-${String(count + 1).padStart(4, '0')}`;
    const mealData = MEALS.find((m) => m.name === this.meal);
    if (mealData) this.totalPrice = mealData.price * this.quantity;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
module.exports.MEALS = MEALS;
