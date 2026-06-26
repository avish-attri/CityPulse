import Event from "../models/Event.js";

import { uploadToCloudinary } from "../middleware/upload.js";

import { getLocationCoordinates } from "../utils/geo.js";

import { asyncHandler } from "../middleware/validate.js";

import User from "../models/User.js";

export const getEvents = asyncHandler(async (req, res) => {
  const { city, category, upcoming, page = 1, limit = 20 } = req.query;

  const filter = {};

  if (city) filter.city = city;

  if (category) filter.category = category;

  if (upcoming === "true") filter.startDate = { $gte: new Date() };

  const events = await Event.find(filter)

    .populate("organizer", "name avatar")

    .sort({ startDate: 1 })

    .skip((page - 1) * limit)

    .limit(Number(limit));

  const total = await Event.countDocuments(filter);

  res.json({ success: true, events, total, page: Number(page) });
});

export const getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate(
    "organizer",

    "name avatar",
  );

  if (!event) return res.status(404).json({ message: "Event not found" });

  res.json({ success: true, event });
});

export const createEvent = asyncHandler(async (req, res) => {
  const coords = await getLocationCoordinates(req.body, req.user?.city);

  if (!coords)
    return res
      .status(400)
      .json({ message: "Valid coordinates required for event location" });

  let image = "";

  if (req.file)
    image = await uploadToCloudinary(req.file.buffer, "citypulse/events");

  const event = await Event.create({
    title: req.body.title,

    description: req.body.description,

    category: req.body.category,

    image,

    startDate: req.body.startDate,

    location: {
      type: "Point",

      coordinates: coords,

      venue: req.body.venue || "",
    },

    city: req.body.city || req.user.city,

    organizer: req.user._id,
  });

  await User.findByIdAndUpdate(req.user._id, {
    $inc: { "stats.eventsCreated": 1 },
  });

  await event.populate("organizer", "name avatar");

  res.status(201).json({ success: true, event });
});

export const rsvpEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) return res.status(404).json({ message: "Event not found" });

  const uid = req.user._id.toString();

  const has = event.rsvps.some((id) => id.toString() === uid);

  if (has) {
    event.rsvps = event.rsvps.filter((id) => id.toString() !== uid);
  } else {
    event.rsvps.push(req.user._id);
  }

  await event.save();

  res.json({ success: true, event, rsvped: !has });
});

export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) return res.status(404).json({ message: "Not found" });

  if (
    event.organizer.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return res.status(403).json({ message: "Not authorized" });
  }

  await event.deleteOne();

  res.json({ success: true });
});
