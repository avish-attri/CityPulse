import { formatDistanceToNow, format } from "date-fns";

export const CHANDIGARH_CENTER = [30.7333, 76.7794];

export const PULSE_CATEGORIES = [
  "Traffic",
  "Road Closure",
  "Power Cut",
  "Water Issue",
  "Accident",
  "Event",
  "Safety Alert",
  "Public Announcement",
  "Other",
];

export const DISCOVERY_CATEGORIES = [
  "Cafe",
  "Restaurant",
  "Food Stall",
  "Study Spot",
  "Park",
  "Shopping",
  "Scenic",
  "Other",
];

export const EVENT_CATEGORIES = [
  "College Fest",
  "Hackathon",
  "Sports",
  "Meetup",
  "Cultural",
  "Other",
];

export const timeAgo = (date) =>
  formatDistanceToNow(new Date(date), { addSuffix: true });

export const formatDate = (date) =>
  format(new Date(date), "MMM d, yyyy h:mm a");

export const getInitials = (name) =>
  name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

export const getUserLocation = () =>
  new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ lat: CHANDIGARH_CENTER[0], lng: CHANDIGARH_CENTER[1] });

      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),

      () => resolve({ lat: CHANDIGARH_CENTER[0], lng: CHANDIGARH_CENTER[1] }),

      { timeout: 5000 },
    );
  });
