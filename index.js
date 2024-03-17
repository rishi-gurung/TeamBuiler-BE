const express = require("express");
const sqlite3 = require("sqlite3").verbose();
var cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const db = new sqlite3.Database("database.db");

db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS teams (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, team TEXT, date TEXT, time TEXT)"
  );
});

app.post("/add-team", (req, res) => {
  const { username, team, date, time } = req.body;

  console.log("Received request body:", req.body);

  const query = `INSERT INTO teams (username, team, date, time) VALUES (?, ?, ?, ?)`;
  db.run(query, [username, team, date, time], function (err) {
    if (err) {
      console.error("Error inserting into database:", err);
      return res.status(500).json({ error: err.message });
    }
    console.log("Team added successfully:", this.lastID);
    res.json({ error: "0", lastID: this.lastID });
  });
});

app.get("/user-rows", (req, res) => {
  const username = req.query.username;

  const query = `SELECT COUNT(*) AS count FROM teams WHERE username = ?`;
  db.get(query, [username], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    console.log(row);
    res.json({ count: row["count"] });
  });
});

app.get("/user-teams", (req, res) => {
  const username = req.query.username;

  const query = `SELECT date, time FROM teams WHERE username = ?`;
  db.all(query, [username], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ rows });
  });
});

app.get("/teams", (req, res) => {
  const id = req.query.id;
  const query = `SELECT team FROM teams WHERE id = ?`;
  db.get(query, [id], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ rows });
  });
});

const port = 4000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
