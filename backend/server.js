
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

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
