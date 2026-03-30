const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });
const { Order } = require('./src/models');

const debug = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant_gpt');
    
    console.log('--- LATEST 10 ORDERS ---');
    const orders = await Order.find().sort({ orderedAt: -1 }).limit(10).lean();
    
    orders.forEach(o => {
      console.log(`Order: ${o.orderNumber}`);
      console.log(`  Status: ${o.status}`);
      console.log(`  Restaurant: ${o.restaurantId}`);
      console.log(`  GuestSession: ${o.guestSessionId}`);
      console.log(`  Customer: ${o.customerId}`);
      console.log('------------------------');
    });

    process.exit(0);
  } catch (error) {
    console.error('Debug failed:', error);
    process.exit(1);
  }
};

debug();
