import PulsePost from "../models/PulsePost.js";

import Discovery from "../models/Discovery.js";

import Event from "../models/Event.js";

import { buildGeoQuery } from "../utils/geo.js";

import { asyncHandler } from "../middleware/validate.js";

export const getNearby = asyncHandler(async (req, res) => {
  const { lng, lat, city } = req.query;

  if (!lng || !lat)
    return res.status(400).json({ message: "lng and lat required" });

  const maxDistance = 50;

  const geoFilter = buildGeoQuery(lng, lat, maxDistance);

  const cityFilter = city ? { city } : {};

  const [pulse, discoveries, events] = await Promise.all([
    PulsePost.find({
      ...geoFilter,
      ...cityFilter,
      ...PulsePost.getActiveFilter(),
    })

      .populate("author", "name avatar")

      .sort({ createdAt: -1 })

      .limit(15),

    Discovery.find({ ...geoFilter, ...cityFilter })

      .populate("author", "name avatar")

      .sort({ averageRating: -1 })

      .limit(10),

    Event.find({ ...geoFilter, ...cityFilter, startDate: { $gte: new Date() } })

      .populate("organizer", "name avatar")

      .sort({ startDate: 1 })

      .limit(10),
  ]);

  res.json({ success: true, pulse, discoveries, events, radius: maxDistance });
});
