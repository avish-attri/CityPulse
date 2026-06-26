import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },

    description: { type: String, required: true, maxlength: 3000 },

    category: {
      type: String,

      enum: [
        "College Fest",
        "Hackathon",
        "Sports",
        "Meetup",
        "Cultural",
        "Other",
      ],

      required: true,
    },

    image: { type: String, default: "" },

    startDate: { type: Date, required: true },

    location: {
      type: { type: String, enum: ["Point"], default: "Point" },

      coordinates: { type: [Number], required: true },

      venue: { type: String, default: "" },
    },

    city: { type: String, default: "Chandigarh" },

    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    rsvps: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },

  { timestamps: true },
);

eventSchema.index({ location: "2dsphere" });

eventSchema.index({ city: 1, startDate: 1 });

const Event = mongoose.model("Event", eventSchema);

export default Event;
