import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6, select: false },
    avatar: { type: String, default: "" },
    city: { type: String, default: "Chandigarh" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    stats: {
      postsCount: { type: Number, default: 0 },
      discoveriesCount: { type: Number, default: 0 },
      questionsAnswered: { type: Number, default: 0 },
      eventsCreated: { type: Number, default: 0 },
    },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [76.7794, 30.7333] },
    },
  },
  { timestamps: true },
);

userSchema.index({ location: "2dsphere" });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
