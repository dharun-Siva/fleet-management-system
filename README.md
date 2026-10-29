# Fleet Management System

A Fleet Management System built using React.js, Node.js, Express.js, and PostgreSQL. This application retrieves and displays fleet information through REST APIs, including vehicles, drivers, customers, trip details, and maintenance records.

## Technologies Used

- **Frontend:** React.js, Vite
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **API Communication:** REST APIs
- **Database Queries:** SQL, including JOIN operations

## Features

- View registered vehicles and their status.
- View driver contact and license information.
- View customer contact information.
- View trip details, including customer, driver, and vehicle information.
- View vehicle maintenance records and service costs.
- Retrieve individual table data using REST APIs.
- Retrieve related trip information using SQL JOIN queries.
- Display data in tables in the React frontend.
- Handle API loading states and errors.

## Project Structure

```text
fleet-management-system/
├── backend/
│   ├── server.js
│   ├── db.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   ├── package.json
│   └── index.html
├── .gitignore
└── README.md
```

## Prerequisites

- Node.js and npm
- PostgreSQL
- Git

## Database Setup

1. Open PostgreSQL using pgAdmin or the PostgreSQL command line.
2. Create a database named `fleet_management`.
3. Create the five tables: `customers`, `drivers`, `vehicles`, `trips`, and `maintenance`.
4. Configure the PostgreSQL connection details in `backend/.env`.

Example environment variables:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fleet_management
DB_USER=postgres
DB_PASSWORD=your_local_password
```

Replace the example password with your local PostgreSQL password. Do not commit the `.env` file to GitHub.


## Run the Backend

Open a terminal and run:

```bash
cd backend
npm install
node server.js
```

The backend runs at:

`http://localhost:5000`


## Run the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL shown in the terminal, usually:

`http://localhost:5173`

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/test-db` | Test database connectivity |
| GET | `/api/vehicles` | Retrieve vehicles |
| GET | `/api/drivers` | Retrieve drivers |
| GET | `/api/customers` | Retrieve customers |
| GET | `/api/trips` | Retrieve trip records |
| GET | `/api/trips/details` | Retrieve joined trip details |
| GET | `/api/maintenance` | Retrieve maintenance records |

## Project Objective

The objective of this project is to demonstrate PostgreSQL table relationships, SQL queries, JOIN operations, REST API development with Node.js and Express.js, and API integration with React.js.
