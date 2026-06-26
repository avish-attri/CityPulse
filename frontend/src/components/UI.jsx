import { getInitials } from "../utils/helpers";

export function Avatar({ user, size = "md" }) {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-xl",
  };

  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name}
        className={`${sizes[size]} rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} rounded-full bg-gradient-to-br from-primary-500 to-accent flex items-center justify-center text-white font-semibold`}
    >
      {getInitials(user?.name)}
    </div>
  );
}

export function CategoryBadge({ category }) {
  const colors = {
    Traffic:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",

    "Road Closure": "bg-red-100 text-red-700",

    "Power Cut": "bg-yellow-100 text-yellow-700",

    "Water Issue": "bg-blue-100 text-blue-700",

    Accident: "bg-red-100 text-red-800",

    Event: "bg-purple-100 text-purple-700",

    "Safety Alert": "bg-rose-100 text-rose-700",

    "Public Announcement": "bg-indigo-100 text-indigo-700",

    Other: "bg-gray-100 text-gray-600",

    Cafe: "bg-amber-100 text-amber-700",

    "Food Stall": "bg-orange-100 text-orange-700",

    "Study Spot": "bg-blue-100 text-blue-700",

    Park: "bg-green-100 text-green-700",

    Shopping: "bg-pink-100 text-pink-700",

    Scenic: "bg-teal-100 text-teal-700",

    "College Fest": "bg-purple-100 text-purple-700",

    Hackathon: "bg-indigo-100 text-indigo-700",

    Sports: "bg-green-100 text-green-700",

    Meetup: "bg-blue-100 text-blue-700",

    Cultural: "bg-rose-100 text-rose-700",
  };

  return (
    <span className={`badge ${colors[category] || colors.Other}`}>
      {category}
    </span>
  );
}

export function StarRating({ rating, count }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-amber-400">★</span>

      <span className="font-semibold">{rating || "—"}</span>

      {count !== undefined && (
        <span className="text-gray-400 text-sm">({count})</span>
      )}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <Icon className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
      )}

      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
        {title}
      </h3>

      <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
        {description}
      </p>

      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function LoadingSpinner({ size = "md" }) {
  const sizes = { sm: "w-5 h-5", md: "w-8 h-8", lg: "w-12 h-12" };

  return (
    <div className="flex justify-center py-12">
      <div
        className={`${sizes[size]} border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin`}
      />
    </div>
  );
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-semibold">{title}</h2>

          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
          >
            ✕
          </button>
        </div>

        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
