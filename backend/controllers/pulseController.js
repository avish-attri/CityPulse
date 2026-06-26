import PulsePost from "../models/PulsePost.js";

import { uploadToCloudinary } from "../middleware/upload.js";

import { getLocationCoordinates } from "../utils/geo.js";

import { asyncHandler } from "../middleware/validate.js";

import User from "../models/User.js";

export const getPosts = asyncHandler(async (req, res) => {
  const {
    city,
    category,
    archived,
    page = 1,
    limit = 20,
    sort = "-createdAt",
  } = req.query;

  const filter =
    archived === "true"
      ? { expiresAt: { $lte: new Date() } }
      : PulsePost.getActiveFilter();

  if (city) filter.city = city;

  if (category) filter.category = category;

  const posts = await PulsePost.find(filter)

    .populate("author", "name avatar")

    .sort(sort)

    .skip((page - 1) * limit)

    .limit(Number(limit));

  const total = await PulsePost.countDocuments(filter);

  res.json({
    success: true,
    posts,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
  });
});

export const getPost = asyncHandler(async (req, res) => {
  const post = await PulsePost.findById(req.params.id).populate(
    "author",

    "name avatar",
  );

  if (!post || post.expiresAt <= new Date())
    return res.status(404).json({ message: "Post not found" });

  res.json({ success: true, post });
});

export const createPost = asyncHandler(async (req, res) => {
  const coords = await getLocationCoordinates(req.body, req.user?.city);

  if (!coords)
    return res
      .status(400)
      .json({ message: "Valid coordinates required for location" });

  let image = "";

  if (req.file)
    image = await uploadToCloudinary(req.file.buffer, "citypulse/pulse");

  const category = req.body.category;

  const post = await PulsePost.create({
    title: req.body.title,

    description: req.body.description,

    category,

    image,

    location: {
      type: "Point",

      coordinates: coords,

      address: req.body.address || "",

      area: req.body.area || "",
    },

    city: req.body.city || req.user.city,

    author: req.user._id,

    expiresAt: PulsePost.getExpiryDate(category),
  });

  await User.findByIdAndUpdate(req.user._id, {
    $inc: { "stats.postsCount": 1 },
  });

  await post.populate("author", "name avatar");

  res.status(201).json({ success: true, post });
});

export const confirmPost = asyncHandler(async (req, res) => {
  const post = await PulsePost.findById(req.params.id);

  if (!post) return res.status(404).json({ message: "Post not found" });

  const uid = req.user._id.toString();

  const confirmed = post.confirmations.some((id) => id.toString() === uid);

  if (confirmed) {
    post.confirmations = post.confirmations.filter(
      (id) => id.toString() !== uid,
    );
  } else {
    post.confirmations.push(req.user._id);
  }

  await post.save();

  res.json({ success: true, post });
});

export const resolvePost = asyncHandler(async (req, res) => {
  const post = await PulsePost.findById(req.params.id);

  if (!post) return res.status(404).json({ message: "Post not found" });

  if (
    post.author.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return res.status(403).json({ message: "Not authorized" });
  }

  post.isResolved = true;

  post.expiresAt = new Date();

  await post.save();

  res.json({ success: true, post });
});

export const deletePost = asyncHandler(async (req, res) => {
  const post = await PulsePost.findById(req.params.id);

  if (!post) return res.status(404).json({ message: "Post not found" });

  if (
    post.author.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return res.status(403).json({ message: "Not authorized" });
  }

  await post.deleteOne();

  res.json({ success: true, message: "Post deleted" });
});
