require("dotenv").config();
const mongoose = require("mongoose");
//const mongodbUrl = "mongodb+srv://DBaAKASH:aakash1234@cluster0.sjxp0gf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";


mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("Connected to MongoDB Server"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

const db = mongoose.connection;
db.on("disconnected", () => {
  console.log("MongoDB Disconnected");
});

module.exports = db;