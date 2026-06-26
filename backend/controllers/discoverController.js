import Discovery from "../models/Discovery.js";

import { uploadToCloudinary } from "../middleware/upload.js";

import { getLocationCoordinates } from "../utils/geo.js";

import { asyncHandler } from "../middleware/validate.js";

import User from "../models/User.js";

export const getDiscoveries = asyncHandler(async (req, res) => {
  const { city, category, tag, page = 1, limit = 20 } = req.query;

  const filter = {};

  if (city) filter.city = city;

  if (category) filter.category = category;

  if (tag) filter.tags = tag;

  const discoveries = await Discovery.find(filter)

    .populate("author", "name avatar")

    .sort({ averageRating: -1, createdAt: -1 })

    .skip((page - 1) * limit)

    .limit(Number(limit));

  const total = await Discovery.countDocuments(filter);

  res.json({ success: true, discoveries, total, page: Number(page) });
});

export const getDiscovery = asyncHandler(async (req, res) => {
  const discovery = await Discovery.findById(req.params.id).populate(
    "author",

    "name avatar",
  );

  if (!discovery)
    return res.status(404).json({ message: "Discovery not found" });

  res.json({ success: true, discovery });
});

export const createDiscovery = asyncHandler(async (req, res) => {
  const coords = await getLocationCoordinates(req.body, req.user?.city);

  if (!coords)
    return res
      .status(400)
      .json({ message: "Valid coordinates required for discovery location" });

  const images = [];

  if (req.files?.length) {
    for (const file of req.files) {
      const url = await uploadToCloudinary(
        file.buffer,
        "citypulse/discoveries",
      );

      if (url) images.push(url);
    }
  }

  const tags = req.body.tags
    ? Array.isArray(req.body.tags)
      ? req.body.tags
      : req.body.tags.split(",").map((t) => t.trim())
    : [];

  const discovery = await Discovery.create({
    title: req.body.title,

    description: req.body.description,

    category: req.body.category,

    images,

    tags,

    location: {
      type: "Point",

      coordinates: coords,

      area: req.body.area || "",
    },

    city: req.body.city || req.user.city,

    author: req.user._id,
  });

  await User.findByIdAndUpdate(req.user._id, {
    $inc: { "stats.discoveriesCount": 1 },
  });

  await discovery.populate("author", "name avatar");

  res.status(201).json({ success: true, discovery });
});

export const rateDiscovery = asyncHandler(async (req, res) => {
  const { score } = req.body;

  if (!score || score < 1 || score > 5)
    return res.status(400).json({ message: "Score 1-5 required" });

  const discovery = await Discovery.findById(req.params.id);

  if (!discovery) return res.status(404).json({ message: "Not found" });

  const idx = discovery.ratings.findIndex((r) => {
    const rUserId = r.user?._id ? String(r.user._id) : String(r.user);
    return rUserId === String(req.user._id);
  });

  if (idx >= 0) discovery.ratings[idx].score = score;
  else discovery.ratings.push({ user: req.user._id, score });

  discovery.recalculateRating();

  await discovery.save();

  res.json({ success: true, discovery });
});

export const deleteDiscovery = asyncHandler(async (req, res) => {
  const discovery = await Discovery.findById(req.params.id);

  if (!discovery) return res.status(404).json({ message: "Not found" });

  if (
    discovery.author.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return res.status(403).json({ message: "Not authorized" });
  }

  await discovery.deleteOne();

  res.json({ success: true });
});
