const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });
const { Restaurant, Table } = require("./models");

const check = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/restaurant_gpt",
    );
    const tableCount = await Table.countDocuments();
    const tables = await Table.find().limit(20).lean();

    console.log(`TOTAL TABLES IN DB: ${tableCount}`);
    tables.forEach((t) => {
      console.log(
        `- Restaurant: ${t.restaurantId}, TableNo: ${t.tableNo}, qrId: ${t.qrId}`,
      );
    });

    process.exit(0);
  } catch (error) {
    console.error("Check failed:", error);
    process.exit(1);
  }
};

check();
