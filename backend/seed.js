import dotenv from "dotenv";
import connectDB from "./config/db.js";
import User from "./models/User.js";

dotenv.config();

const seed = async () => {
  await connectDB();
  await User.deleteMany({});

  await User.create({
    name: "Admin User",
    email: "admin@citypulse.ai",
    password: "admin123",
    role: "admin",
  });

  console.log("Admin user created successfully!");
  console.log("Admin: admin@citypulse.ai / admin123");
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
