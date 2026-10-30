import { lazy, Suspense, useEffect, useState } from "react";
import "./App.css";

const AnalyticsDashboard = lazy(() => import("./AnalyticsDashboard.jsx"));

const navigationItems = [
  { id: "dashboard", label: "Dashboard", mark: "D" },
  { id: "analytics", label: "Analytics", mark: "A" },
  { id: "vehicles", label: "Vehicles", mark: "V" },
  { id: "drivers", label: "Drivers", mark: "DR" },
  { id: "customers", label: "Customers", mark: "C" },
  { id: "trips", label: "Trips", mark: "T" },
  { id: "maintenance", label: "Maintenance", mark: "M" },
];

function TableSection({
  id,
  title,
  description,
  columns,
  rows,
  totalRows,
  hasActiveFilter,
  controls,
  loading,
  error,
}) {
  return (
    <section className="table-section" id={id}>
      <div className="section-heading">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <span className="record-count">
          {hasActiveFilter ? `${rows.length} of ${totalRows} records` : `${totalRows} records`}
        </span>
      </div>

      {controls}
      {loading && <p className="table-message">Loading {title.toLowerCase()}...</p>}
      {!loading && error && <p className="table-message error-message">{error}</p>}
      {!loading && !error && totalRows === 0 && (
        <p className="table-message">No {title.toLowerCase()} found.</p>
      )}
      {!loading && !error && totalRows > 0 && rows.length === 0 && (
        <p className="table-message">No {title.toLowerCase()} match your search or filter.</p>
      )}
      {!loading && !error && rows.length > 0 && (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.key} scope="col">
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row[columns[0].key] ?? index}>
                  {columns.map((column) => {
                    const value = column.render
                      ? column.render(row[column.key], row)
                      : row[column.key] ?? "—";

                    return (
                      <td key={column.key}>
                        {column.key === "status" ? (
                          <span
                            className="status-badge"
                            data-status={String(value).trim().toLowerCase()}
                          >
                            {value}
                          </span>
                        ) : (
                          value
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function App() {
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading] = useState({
    vehicles: true,
    trips: true,
    drivers: true,
    customers: true,
    maintenance: true,
  });
  const [errors, setErrors] = useState({});
  const [activeSection, setActiveSection] = useState("dashboard");
  const [analyticsRefreshKey, setAnalyticsRefreshKey] = useState(0);
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [driverSearch, setDriverSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [tripStatus, setTripStatus] = useState("");
  const [maintenanceSearch, setMaintenanceSearch] = useState("");

  useEffect(() => {
    const fetchResource = (url, name, setData, errorMessage) => {
      fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error(errorMessage);
          }
          return response.json();
        })
        .then(setData)
        .catch((err) => {
          console.error(`Error fetching ${name}:`, err);
          setErrors((currentErrors) => ({
            ...currentErrors,
            [name]: err.message,
          }));
        })
        .finally(() => {
          setLoading((currentLoading) => ({
            ...currentLoading,
            [name]: false,
          }));
        });
    };

    fetchResource(
      "http://localhost:5000/api/vehicles",
      "vehicles",
      setVehicles,
      "Failed to fetch vehicles",
    );
    fetchResource(
      "http://localhost:5000/api/trips/details",
      "trips",
      setTrips,
      "Failed to fetch trips",
    );
    fetchResource(
      "http://localhost:5000/api/drivers",
      "drivers",
      setDrivers,
      "Failed to fetch drivers",
    );
    fetchResource(
      "http://localhost:5000/api/customers",
      "customers",
      setCustomers,
      "Failed to fetch customers",
    );
    fetchResource(
      "http://localhost:5000/api/maintenance",
      "maintenance",
      setMaintenance,
      "Failed to fetch maintenance records",
    );
  }, []);

  const searchIncludes = (value, query) =>
    String(value ?? "").toLowerCase().includes(query.trim().toLowerCase());

  const filteredVehicles = vehicles.filter((vehicle) =>
    [vehicle.registration_number, vehicle.model, vehicle.vehicle_type].some((value) =>
      searchIncludes(value, vehicleSearch),
    ),
  );
  const filteredDrivers = drivers.filter((driver) =>
    [driver.name, driver.license_number].some((value) => searchIncludes(value, driverSearch)),
  );
  const filteredCustomers = customers.filter((customer) =>
    [customer.name, customer.email].some((value) => searchIncludes(value, customerSearch)),
  );
  const filteredTrips = trips.filter(
    (trip) =>
      !tripStatus ||
      String(trip.status ?? "").toLowerCase() === tripStatus.toLowerCase(),
  );
  const filteredMaintenance = maintenance.filter((item) =>
    [item.service_type, item.vehicle_id].some((value) =>
      searchIncludes(value, maintenanceSearch),
    ),
  );
  const tripStatuses = [
    ...new Map(
      trips
        .map((trip) => String(trip.status ?? "").trim())
        .filter(Boolean)
        .map((status) => [status.toLowerCase(), status]),
    ).values(),
  ].sort((first, second) => first.localeCompare(second));

  const activeTrips = trips.filter((trip) => {
    const status = String(trip.status ?? "").trim().toLowerCase();
    return ["active", "in progress", "ongoing"].includes(status);
  }).length;

  const summaryCards = [
    { label: "Total Vehicles", value: vehicles.length, mark: "V", note: "In your fleet" },
    { label: "Total Drivers", value: drivers.length, mark: "DR", note: "Available in directory" },
    { label: "Total Customers", value: customers.length, mark: "C", note: "In your directory" },
    { label: "Active Trips", value: activeTrips, mark: "T", note: "Currently in progress" },
    {
      label: "Maintenance Records",
      value: maintenance.length,
      mark: "M",
      note: "Service records logged",
    },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#dashboard" onClick={() => setActiveSection("dashboard")}>
          <span className="brand-mark">F</span>
          <span>Fleet Management</span>
        </a>

        <p className="nav-caption">WORKSPACE</p>
        <nav className="sidebar-nav" aria-label="Dashboard sections">
          {navigationItems.map((item) => (
            <a
              className={`nav-link ${activeSection === item.id ? "is-active" : ""}`}
              href={`#${item.id}`}
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                if (item.id === "analytics") {
                  setAnalyticsRefreshKey((currentKey) => currentKey + 1);
                }
              }}
            >
              <span className="nav-mark" aria-hidden="true">
                {item.mark}
              </span>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="connection-indicator" />
          <span>Fleet overview</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">FLEET OPERATIONS</p>
            <h1>Dashboard</h1>
          </div>
          <span className="topbar-label">Management overview</span>
        </header>

        <div className="dashboard-content">
          <section className="welcome-panel" id="dashboard">
            <div>
              <p className="eyebrow">OVERVIEW</p>
              <h2>Your fleet at a glance</h2>
              <p>Monitor vehicles, people, trips, and maintenance in one place.</p>
            </div>
            <div className="welcome-decoration" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </section>

          <section className="summary-grid" aria-label="Fleet summary">
            {summaryCards.map((card) => (
              <article className="summary-card" key={card.label}>
                <div className="summary-card-top">
                  <span>{card.label}</span>
                  <span className="summary-mark" aria-hidden="true">
                    {card.mark}
                  </span>
                </div>
                <strong>{card.value}</strong>
                <p>{card.note}</p>
              </article>
            ))}
          </section>

          <div className="data-sections">
            <section className="analytics-section" id="analytics">
              {activeSection === "analytics" ? (
                <Suspense
                  fallback={
                    <p className="analytics-message" role="status">
                      Loading analytics dashboard...
                    </p>
                  }
                >
                  <AnalyticsDashboard refreshKey={analyticsRefreshKey} />
                </Suspense>
              ) : (
                <div className="analytics-section-heading">
                  <div>
                    <p className="eyebrow">FLEET INSIGHTS</p>
                    <h2>Analytics Dashboard</h2>
                    <p>Select Analytics to load the latest PostgreSQL records.</p>
                  </div>
                </div>
              )}
            </section>
            <TableSection
              id="vehicles"
              title="Vehicles"
              description="Registered vehicles across your fleet"
              columns={[
                { key: "vehicle_id", label: "ID" },
                { key: "registration_number", label: "Registration" },
                { key: "model", label: "Model" },
                { key: "vehicle_type", label: "Type" },
                { key: "status", label: "Status" },
              ]}
              rows={filteredVehicles}
              totalRows={vehicles.length}
              hasActiveFilter={vehicleSearch.trim() !== ""}
              controls={
                <div className="table-controls">
                  <input
                    className="table-search"
                    type="search"
                    aria-label="Search vehicles by registration, model, or type"
                    placeholder="Search registration, model, or type"
                    value={vehicleSearch}
                    onChange={(event) => setVehicleSearch(event.target.value)}
                  />
                </div>
              }
              loading={loading.vehicles}
              error={errors.vehicles}
            />
            <TableSection
              id="drivers"
              title="Drivers"
              description="Driver contact and license information"
              columns={[
                { key: "driver_id", label: "ID" },
                { key: "name", label: "Name" },
                { key: "phone", label: "Phone" },
                { key: "license_number", label: "License Number" },
              ]}
              rows={filteredDrivers}
              totalRows={drivers.length}
              hasActiveFilter={driverSearch.trim() !== ""}
              controls={
                <div className="table-controls">
                  <input
                    className="table-search"
                    type="search"
                    aria-label="Search drivers by name or license number"
                    placeholder="Search name or license number"
                    value={driverSearch}
                    onChange={(event) => setDriverSearch(event.target.value)}
                  />
                </div>
              }
              loading={loading.drivers}
              error={errors.drivers}
            />
            <TableSection
              id="customers"
              title="Customers"
              description="Customer contact information"
              columns={[
                { key: "customer_id", label: "ID" },
                { key: "name", label: "Name" },
                { key: "phone", label: "Phone" },
                { key: "email", label: "Email" },
              ]}
              rows={filteredCustomers}
              totalRows={customers.length}
              hasActiveFilter={customerSearch.trim() !== ""}
              controls={
                <div className="table-controls">
                  <input
                    className="table-search"
                    type="search"
                    aria-label="Search customers by name or email"
                    placeholder="Search name or email"
                    value={customerSearch}
                    onChange={(event) => setCustomerSearch(event.target.value)}
                  />
                </div>
              }
              loading={loading.customers}
              error={errors.customers}
            />
            <TableSection
              id="trips"
              title="Trips"
              description="Trip assignments, routes, and current status"
              columns={[
                { key: "trip_id", label: "Trip ID" },
                { key: "customer_name", label: "Customer" },
                { key: "driver_name", label: "Driver" },
                { key: "registration_number", label: "Vehicle" },
                { key: "source", label: "Source" },
                { key: "destination", label: "Destination" },
                { key: "status", label: "Status" },
              ]}
              rows={filteredTrips}
              totalRows={trips.length}
              hasActiveFilter={tripStatus !== ""}
              controls={
                <div className="table-controls">
                  <select
                    className="table-filter"
                    aria-label="Filter trips by status"
                    value={tripStatus}
                    onChange={(event) => setTripStatus(event.target.value)}
                  >
                    <option value="">All statuses</option>
                    {tripStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              }
              loading={loading.trips}
              error={errors.trips}
            />
            <TableSection
              id="maintenance"
              title="Maintenance"
              description="Service history and associated costs"
              columns={[
                { key: "maintenance_id", label: "ID" },
                { key: "vehicle_id", label: "Vehicle ID" },
                { key: "service_type", label: "Service Type" },
                {
                  key: "service_date",
                  label: "Service Date",
                  render: (value) => {
                    if (!value) {
                      return "—";
                    }

                    const [year, month, day] = String(value)
                      .slice(0, 10)
                      .split("-")
                      .map(Number);
                    const date = new Date(year, month - 1, day);

                    if (
                      !Number.isFinite(date.getTime()) ||
                      date.getFullYear() !== year ||
                      date.getMonth() !== month - 1 ||
                      date.getDate() !== day
                    ) {
                      return String(value);
                    }

                    return new Intl.DateTimeFormat("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }).format(date);
                  },
                },
                {
                  key: "cost",
                  label: "Cost",
                  render: (value) => {
                    const cost = Number(value);
                    return value === null || value === "" || !Number.isFinite(cost)
                      ? value ?? "—"
                      : new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                        }).format(cost);
                  },
                },
                { key: "notes", label: "Notes" },
              ]}
              rows={filteredMaintenance}
              totalRows={maintenance.length}
              hasActiveFilter={maintenanceSearch.trim() !== ""}
              controls={
                <div className="table-controls">
                  <input
                    className="table-search"
                    type="search"
                    aria-label="Search maintenance by service type or vehicle ID"
                    placeholder="Search service type or vehicle ID"
                    value={maintenanceSearch}
                    onChange={(event) => setMaintenanceSearch(event.target.value)}
                  />
                </div>
              }
              loading={loading.maintenance}
              error={errors.maintenance}
            />
          </div>
          <footer className="page-footer">Fleet Management · Operations dashboard</footer>
        </div>
      </main>
    </div>
  );
}

export default App;
