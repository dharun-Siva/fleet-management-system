import { useEffect, useState } from "react";

function App() {
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/vehicles")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch vehicles");
        }
        return response.json();
      })
      .then((data) => {
        setVehicles(data);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });

    fetch("http://localhost:5000/api/trips/details")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch trips");
        }
        return response.json();
      })
      .then((data) => {
        setTrips(data);
      })
      .catch((err) => {
        console.error("Error fetching trips:", err);
      });

    fetch("http://localhost:5000/api/drivers")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch drivers");
        }
        return response.json();
      })
      .then((data) => {
        setDrivers(data);
      })
      .catch((err) => {
        console.error("Error fetching drivers:", err);
      });

    fetch("http://localhost:5000/api/customers")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch customers");
        }
        return response.json();
      })
      .then((data) => {
        setCustomers(data);
      })
      .catch((err) => {
        console.error("Error fetching customers:", err);
      });

    fetch("http://localhost:5000/api/maintenance")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch maintenance records");
        }
        return response.json();
      })
      .then((data) => {
        setMaintenance(data);
      })
      .catch((err) => {
        console.error("Error fetching maintenance:", err);
      });

  }, []);

  return (
    <div>
      <h1>Fleet Management System</h1>
      <h2>Vehicles</h2>

      {loading && <p>Loading vehicles...</p>}
      {error && <p>{error}</p>}

      {!loading && !error && (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>ID</th>
              <th>Registration</th>
              <th>Model</th>
              <th>Type</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {vehicles.map((vehicle) => (
              <tr key={vehicle.vehicle_id}>
                <td>{vehicle.vehicle_id}</td>
                <td>{vehicle.registration_number}</td>
                <td>{vehicle.model}</td>
                <td>{vehicle.vehicle_type}</td>
                <td>{vehicle.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2>Trip Details</h2>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Trip ID</th>
            <th>Customer</th>
            <th>Driver</th>
            <th>Vehicle</th>
            <th>Source</th>
            <th>Destination</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {trips.map((trip) => (
            <tr key={trip.trip_id}>
              <td>{trip.trip_id}</td>
              <td>{trip.customer_name}</td>
              <td>{trip.driver_name}</td>
              <td>{trip.registration_number}</td>
              <td>{trip.source}</td>
              <td>{trip.destination}</td>
              <td>{trip.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Drivers</h2>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Phone</th>
            <th>License Number</th>
          </tr>
        </thead>

        <tbody>
          {drivers.map((driver) => (
            <tr key={driver.driver_id}>
              <td>{driver.driver_id}</td>
              <td>{driver.name}</td>
              <td>{driver.phone}</td>
              <td>{driver.license_number}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Customers</h2>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
          </tr>
        </thead>

        <tbody>
          {customers.map((customer) => (
            <tr key={customer.customer_id}>
              <td>{customer.customer_id}</td>
              <td>{customer.name}</td>
              <td>{customer.phone}</td>
              <td>{customer.email}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Maintenance Records</h2>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>ID</th>
            <th>Vehicle ID</th>
            <th>Service Type</th>
            <th>Service Date</th>
            <th>Cost</th>
            <th>Notes</th>
          </tr>
        </thead>

        <tbody>
          {maintenance.map((item) => (
            <tr key={item.maintenance_id}>
              <td>{item.maintenance_id}</td>
              <td>{item.vehicle_id}</td>
              <td>{item.service_type}</td>
              <td>{item.service_date.slice(0, 10)}</td>
              <td>{item.cost}</td>
              <td>{item.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}

export default App;
