const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const { Restaurant, Table } = require('./models');

const migrate = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant_gpt';
    console.log(`Connecting to: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected');

    const restaurants = await Restaurant.find({});
    console.log(`Found ${restaurants.length} restaurants to process.`);

    for (const restaurant of restaurants) {
      console.log(`Processing ${restaurant.name} (${restaurant.tablesCount} tables)...`);
      
      const existingTables = await Table.find({ restaurantId: restaurant._id });
      const currentCount = existingTables.length;

      if (currentCount < restaurant.tablesCount) {
        const toCreate = restaurant.tablesCount - currentCount;
        console.log(`Creating ${toCreate} missing tables for ${restaurant.name}...`);
        
        for (let i = currentCount + 1; i <= restaurant.tablesCount; i++) {
          await Table.create({
            restaurantId: restaurant._id,
            tableNo: i,
            status: 'active'
          });
        }
      } else {
        console.log(`${restaurant.name} already has ${currentCount} tables. Skipping.`);
      }
    }

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();
