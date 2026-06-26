import mongoose from "mongoose";

const discoverySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true, maxlength: 2000 },
    images: [{ type: String }],
    tags: [{ type: String }],
    category: {
      type: String,
      enum: [
        "Cafe",
        "Restaurant",
        "Food Stall",
        "Study Spot",
        "Park",
        "Shopping",
        "Scenic",
        "Other",
      ],
      required: true,
    },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
      area: { type: String, default: "" },
    },
    city: { type: String, default: "Chandigarh" },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ratings: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        score: { type: Number, min: 1, max: 5 },
      },
    ],
    averageRating: { type: Number, default: 0 },
  },
  { timestamps: true },
);

discoverySchema.index({ location: "2dsphere" });
discoverySchema.index({ city: 1, averageRating: -1 });
discoverySchema.index({ tags: 1 });

discoverySchema.methods.recalculateRating = function () {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
    return;
  }
  const sum = this.ratings.reduce((acc, r) => acc + r.score, 0);
  this.averageRating = Math.round((sum / this.ratings.length) * 10) / 10;
};

const Discovery = mongoose.model("Discovery", discoverySchema);
export default Discovery;
