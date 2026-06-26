import { useQuery } from "@tanstack/react-query";

import { Shield, Users, FileText, BarChart3 } from "lucide-react";

import api from "../api/client";

import { LoadingSpinner } from "../components/UI";

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>

          <p className="text-3xl font-bold mt-1">{value ?? 0}</p>
        </div>

        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const {
    data: analytics,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["admin-analytics"],

    queryFn: () => api.get("/admin/analytics").then((r) => r.data.analytics),
  });

  if (isLoading) return <LoadingSpinner />;

  if (isError)
    return (
      <p className="text-center py-12 text-red-500">
        Unable to load admin data: {error?.message || "Request failed"}
      </p>
    );

  const a = analytics || {};

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary-600" /> Admin Dashboard
        </h1>

        <p className="text-gray-500 text-sm mt-1">
          Platform management & analytics
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total Users"
          value={a.totalUsers}
          icon={Users}
          color="bg-blue-100 text-blue-600 dark:bg-blue-900/30"
        />

        <StatCard
          label="Active Users (30d)"
          value={a.activeUsers}
          icon={Users}
          color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30"
        />

        <StatCard
          label="Live Posts"
          value={a.totalPosts}
          icon={FileText}
          color="bg-orange-100 text-orange-600 dark:bg-orange-900/30"
        />

        <StatCard
          label="Discoveries"
          value={a.totalDiscoveries}
          icon={BarChart3}
          color="bg-purple-100 text-purple-600 dark:bg-purple-900/30"
        />

        <StatCard
          label="Questions"
          value={a.totalQuestions}
          icon={FileText}
          color="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-5">
          <h3 className="font-semibold mb-4">Top Locations</h3>

          {a.topLocations?.length ? (
            a.topLocations.map((loc) => (
              <div
                key={loc._id}
                className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
              >
                <span className="text-sm">{loc._id}</span>

                <span className="text-sm font-medium text-primary-600">
                  {loc.count}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No location data yet</p>
          )}
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-4">Trending Categories</h3>

          {a.trendingCategories?.length ? (
            a.trendingCategories.map((cat) => (
              <div
                key={cat._id}
                className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
              >
                <span className="text-sm">{cat._id}</span>

                <span className="text-sm font-medium text-primary-600">
                  {cat.count}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No category data yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
