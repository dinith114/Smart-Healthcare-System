require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");

const { PORT = 5000, MONGO_URI } = process.env;

mongoose
  .connect(MONGO_URI, { dbName: "smart-healthcare" })
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 API on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("❌ DB connection failed", err);
    process.exit(1);
  });
