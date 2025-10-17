require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");

const { PORT = 5000, MONGO_URI } = process.env;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected to database:", mongoose.connection.name);
    app.listen(PORT, () => console.log(`🚀 API on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("❌ DB connection failed", err);
    process.exit(1);
  });
