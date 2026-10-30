import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./AnalyticsDashboard.css";

const analyticsEndpoints = {
  tripsByCustomer: {
    url: "http://localhost:5000/api/analytics/trips-by-customer",
    error: "Unable to load trips by customer.",
  },
  driversByCustomer: {
    url: "http://localhost:5000/api/analytics/drivers-by-customer",
    error: "Unable to load unique drivers by customer.",
  },
  tripsByStatus: {
    url: "http://localhost:5000/api/analytics/trips-by-status",
    error: "Unable to load trips by status.",
  },
  vehiclesByStatus: {
    url: "http://localhost:5000/api/analytics/vehicles-by-status",
    error: "Unable to load vehicles by status.",
  },
  maintenanceExpenses: {
    url: "http://localhost:5000/api/analytics/maintenance-expenses",
    error: "Unable to load maintenance expenses.",
  },
};

const chartColors = ["#2f80ed", "#45c486", "#f5a524", "#e75a5a", "#8b72d9", "#23a6a6"];
const countFormatter = new Intl.NumberFormat("en-IN");
const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

function AnalyticsCard({ title, description, analytics, children }) {
  return (
    <article className="analytics-card">
      <div className="analytics-card-heading">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>
      {analytics.loading && (
        <div className="analytics-message" role="status">
          <span className="analytics-spinner" aria-hidden="true" />
          Loading analytics...
        </div>
      )}
      {!analytics.loading && analytics.error && (
        <p className="analytics-message analytics-error" role="alert">
          {analytics.error}
        </p>
      )}
      {!analytics.loading && !analytics.error && analytics.data.length === 0 && (
        <p className="analytics-message">No data available yet.</p>
      )}
      {!analytics.loading && !analytics.error && analytics.data.length > 0 && children}
    </article>
  );
}

function CountBarChart({ data }) {
  const chartData = data
    .map((row) => ({ name: row.name, value: Number(row.value) }))
    .filter((row) => Number.isFinite(row.value));

  if (chartData.length === 0) {
    return <p className="analytics-message">No chartable data available.</p>;
  }

  return (
    <div className="analytics-chart" style={{ height: Math.max(260, chartData.length * 38) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 20, bottom: 8 }}>
          <CartesianGrid stroke="#edf0f4" strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fill: "#8290a2", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={125}
            tick={{ fill: "#58677a", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value) => countFormatter.format(Number(value))}
            cursor={{ fill: "#f5f8fc" }}
          />
          <Bar dataKey="value" fill="#2f80ed" radius={[0, 5, 5, 0]} maxBarSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function StatusPieChart({ data, valueKey }) {
  const chartData = data
    .map((row) => ({ name: String(row.status ?? "Unknown"), value: Number(row[valueKey]) }))
    .filter((row) => Number.isFinite(row.value));

  if (chartData.length === 0) {
    return <p className="analytics-message">No chartable data available.</p>;
  }

  return (
    <div className="analytics-chart analytics-pie-chart">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius={58}
            outerRadius={92}
            paddingAngle={3}
          >
            {chartData.map((entry, index) => (
              <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => countFormatter.format(Number(value))} />
          <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function MaintenanceBarChart({ data }) {
  const chartData = data
    .map((row) => ({ name: row.registration_number, value: Number(row.total_cost) }))
    .filter((row) => Number.isFinite(row.value));

  if (chartData.length === 0) {
    return <p className="analytics-message">No chartable data available.</p>;
  }

  return (
    <div className="analytics-chart" style={{ height: Math.max(260, chartData.length * 38) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 24, bottom: 8 }}>
          <CartesianGrid stroke="#edf0f4" strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={(value) => countFormatter.format(Number(value))}
            tick={{ fill: "#8290a2", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={125}
            tick={{ fill: "#58677a", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value) => currencyFormatter.format(Number(value))}
            cursor={{ fill: "#f5f8fc" }}
          />
          <Bar dataKey="value" fill="#45a68a" radius={[0, 5, 5, 0]} maxBarSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function AnalyticsDashboard({ refreshKey }) {
  const [analytics, setAnalytics] = useState(() =>
    Object.fromEntries(
      Object.keys(analyticsEndpoints).map((key) => [
        key,
        { data: [], loading: false, error: "" },
      ]),
    ),
  );

  useEffect(() => {
    const controller = new AbortController();
    setAnalytics((currentAnalytics) =>
      Object.fromEntries(
        Object.entries(currentAnalytics).map(([key, result]) => [
          key,
          { ...result, loading: true, error: "" },
        ]),
      ),
    );

    Object.entries(analyticsEndpoints).forEach(async ([key, endpoint]) => {
      try {
        const response = await fetch(endpoint.url, { signal: controller.signal });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || endpoint.error);
        }
        if (!Array.isArray(data)) {
          throw new Error("The analytics endpoint returned an invalid response.");
        }

        setAnalytics((currentAnalytics) => ({
          ...currentAnalytics,
          [key]: { data, loading: false, error: "" },
        }));
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        console.error(`Error fetching ${key}:`, error);
        setAnalytics((currentAnalytics) => ({
          ...currentAnalytics,
          [key]: {
            ...currentAnalytics[key],
            loading: false,
            error: error.message || endpoint.error,
          },
        }));
      }
    });

    return () => controller.abort();
  }, [refreshKey]);

  const tripsByCustomer = analytics.tripsByCustomer.data.map((row) => ({
    name: row.customer_name,
    value: row.trip_count,
  }));
  const driversByCustomer = analytics.driversByCustomer.data.map((row) => ({
    name: row.customer_name,
    value: row.driver_count,
  }));

  return (
    <>
      <div className="analytics-section-heading">
        <div>
          <p className="eyebrow">FLEET INSIGHTS</p>
          <h2>Analytics Dashboard</h2>
          <p>Live summaries calculated from your PostgreSQL records.</p>
        </div>
      </div>
      <div className="analytics-grid">
        <AnalyticsCard
          title="Trips by Customer"
          description="Total trips assigned to each customer"
          analytics={analytics.tripsByCustomer}
        >
          <CountBarChart data={tripsByCustomer} />
        </AnalyticsCard>
        <AnalyticsCard
          title="Unique Drivers per Customer"
          description="Different drivers assigned to each customer"
          analytics={analytics.driversByCustomer}
        >
          <CountBarChart data={driversByCustomer} />
        </AnalyticsCard>
        <AnalyticsCard
          title="Trips by Status"
          description="Trip records grouped by current status"
          analytics={analytics.tripsByStatus}
        >
          <StatusPieChart data={analytics.tripsByStatus.data} valueKey="trip_count" />
        </AnalyticsCard>
        <AnalyticsCard
          title="Vehicles by Status"
          description="Vehicles grouped by current status"
          analytics={analytics.vehiclesByStatus}
        >
          <StatusPieChart data={analytics.vehiclesByStatus.data} valueKey="vehicle_count" />
        </AnalyticsCard>
        <div className="analytics-card-wide">
          <AnalyticsCard
            title="Maintenance Expenses"
            description="Total recorded maintenance cost by vehicle registration"
            analytics={analytics.maintenanceExpenses}
          >
            <MaintenanceBarChart data={analytics.maintenanceExpenses.data} />
          </AnalyticsCard>
        </div>
      </div>
    </>
  );
}

export default AnalyticsDashboard;
