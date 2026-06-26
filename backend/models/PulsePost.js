import mongoose from "mongoose";

const EXPIRY_HOURS = {
  Traffic: 10,

  "Road Closure": 10,

  Accident: 18,

  "Power Cut": 18,

  "Water Issue": 18,

  Event: 18,

  "Safety Alert": 24,

  "Public Announcement": 24,

  Other: 18,
};

const pulseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },

    description: { type: String, required: true, maxlength: 2000 },

    category: {
      type: String,

      enum: [
        "Traffic",

        "Road Closure",

        "Power Cut",

        "Water Issue",

        "Accident",

        "Event",

        "Safety Alert",

        "Public Announcement",

        "Other",
      ],

      required: true,
    },

    image: { type: String, default: "" },

    location: {
      type: { type: String, enum: ["Point"], default: "Point" },

      coordinates: { type: [Number], required: true },

      address: { type: String, default: "" },

      area: { type: String, default: "" },
    },

    city: { type: String, default: "Chandigarh" },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    confirmations: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    expiresAt: { type: Date, required: true },

    isResolved: { type: Boolean, default: false },
  },

  { timestamps: true },
);

pulseSchema.index({ location: "2dsphere" });

pulseSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

pulseSchema.index({ city: 1, createdAt: -1 });

pulseSchema.index({ category: 1 });

pulseSchema.statics.getExpiryDate = function (category = "Other") {
  const hours = EXPIRY_HOURS[category] || EXPIRY_HOURS.Other;

  return new Date(Date.now() + hours * 60 * 60 * 1000);
};

pulseSchema.statics.getActiveFilter = function () {
  return { expiresAt: { $gt: new Date() } };
};

const PulsePost = mongoose.model("PulsePost", pulseSchema);

export default PulsePost;
