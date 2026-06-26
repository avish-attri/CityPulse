import User from "../models/User.js";
import PulsePost from "../models/PulsePost.js";
import Discovery from "../models/Discovery.js";
import Question from "../models/Question.js";
import Event from "../models/Event.js";
import { asyncHandler } from "../middleware/validate.js";

export const getAnalytics = asyncHandler(async (_req, res) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [
    totalUsers,

    activeUsers,

    totalPosts,

    totalDiscoveries,

    totalQuestions,

    topLocations,

    trendingCategories,
  ] = await Promise.all([
    User.countDocuments(),

    User.countDocuments({ updatedAt: { $gte: thirtyDaysAgo } }),

    PulsePost.countDocuments(PulsePost.getActiveFilter()),

    Discovery.countDocuments(),

    Question.countDocuments(),

    PulsePost.aggregate([
      {
        $match: {
          ...PulsePost.getActiveFilter(),
          "location.area": { $ne: "" },
        },
      },

      { $group: { _id: "$location.area", count: { $sum: 1 } } },

      { $sort: { count: -1 } },

      { $limit: 10 },
    ]),

    PulsePost.aggregate([
      { $match: PulsePost.getActiveFilter() },

      { $group: { _id: "$category", count: { $sum: 1 } } },

      { $sort: { count: -1 } },
    ]),
  ]);

  res.json({
    success: true,

    analytics: {
      totalUsers,

      activeUsers,

      totalPosts,

      totalDiscoveries,

      totalQuestions,

      topLocations,

      trendingCategories,
    },
  });
});
