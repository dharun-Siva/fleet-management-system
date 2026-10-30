
const express = require("express");
const cors = require("cors");
const pool = require("./db");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Fleet Management API is running!");
});

app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      message: "PostgreSQL connected successfully!",
      databaseTime: result.rows[0].now,
    });
  } catch (error) {
    console.error("Database connection error:", error.message);
    res.status(500).json({ error: "Database connection failed" });
  }
});

app.get("/api/vehicles", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM vehicles");

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching vehicles:", error.message);
    res.status(500).json({ error: "Failed to fetch vehicles" });
  }
});

app.get("/api/drivers", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM drivers");

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching drivers:", error.message);
    res.status(500).json({ error: "Failed to fetch drivers" });
  }
});

app.get("/api/customers", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM customers");

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching customers:", error.message);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

app.get("/api/trips", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM trips");

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching trips:", error.message);
    res.status(500).json({ error: "Failed to fetch trips" });
  }
});

app.get("/api/maintenance", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM maintenance");

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching maintenance:", error.message);
    res.status(500).json({ error: "Failed to fetch maintenance records" });
  }
});

app.get("/api/trips/details", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        t.trip_id,
        c.name AS customer_name,
        d.name AS driver_name,
        v.registration_number,
        t.source,
        t.destination,
        t.scheduled_at,
        t.status
      FROM trips t
      JOIN customers c ON t.customer_id = c.customer_id
      JOIN drivers d ON t.driver_id = d.driver_id
      JOIN vehicles v ON t.vehicle_id = v.vehicle_id
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching trip details:", error.message);
    res.status(500).json({ error: "Failed to fetch trip details" });
  }
});

app.get("/api/analytics/trips-by-customer", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        c.customer_id,
        c.name AS customer_name,
        COUNT(t.trip_id)::int AS trip_count
      FROM customers c
      LEFT JOIN trips t ON t.customer_id = c.customer_id
      GROUP BY c.customer_id, c.name
      ORDER BY trip_count DESC, c.name
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching trips by customer:", error.message);
    res.status(500).json({ error: "Failed to fetch trips by customer" });
  }
});

app.get("/api/analytics/drivers-by-customer", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        c.customer_id,
        c.name AS customer_name,
        COUNT(DISTINCT t.driver_id)::int AS driver_count
      FROM customers c
      LEFT JOIN trips t ON t.customer_id = c.customer_id
      GROUP BY c.customer_id, c.name
      ORDER BY driver_count DESC, c.name
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching drivers by customer:", error.message);
    res.status(500).json({ error: "Failed to fetch drivers by customer" });
  }
});

app.get("/api/analytics/trips-by-status", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COALESCE(status, 'Unknown') AS status,
        COUNT(*)::int AS trip_count
      FROM trips
      GROUP BY status
      ORDER BY trip_count DESC, status
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching trips by status:", error.message);
    res.status(500).json({ error: "Failed to fetch trips by status" });
  }
});

app.get("/api/analytics/vehicles-by-status", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COALESCE(status, 'Unknown') AS status,
        COUNT(*)::int AS vehicle_count
      FROM vehicles
      GROUP BY status
      ORDER BY vehicle_count DESC, status
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching vehicles by status:", error.message);
    res.status(500).json({ error: "Failed to fetch vehicles by status" });
  }
});

app.get("/api/analytics/maintenance-expenses", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        v.vehicle_id,
        v.registration_number,
        COALESCE(SUM(m.cost), 0) AS total_cost
      FROM vehicles v
      LEFT JOIN maintenance m ON m.vehicle_id = v.vehicle_id
      GROUP BY v.vehicle_id, v.registration_number
      ORDER BY total_cost DESC, v.registration_number
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching maintenance expenses:", error.message);
    res.status(500).json({ error: "Failed to fetch maintenance expenses" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
