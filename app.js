const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));

// ========================
// DATABASE CONNECTION
// ========================
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false
  }
});

// connect safely
db.connect((err) => {
  if (err) {
    console.log("❌ Database connection FAILED:");
    console.log(err);
  } else {
    console.log("✅ Connected to MySQL Database");
  }
});

// ========================
// HOME PAGE
// ========================
app.get("/", (req, res) => {

  db.query("SELECT * FROM students", (err, results) => {

    // ✅ REAL ERROR DEBUGGING
    if (err) {
      console.log("❌ QUERY ERROR FULL:", err);
      return res.send("Database query failed: " + err.message);
    }

    // prevent crash
    if (!results) results = [];

    let html = `
    <html>
    <head>
    <title>Student System</title>
    </head>
    <body>

    <h2>Student CRUD Dashboard</h2>

    <form method="POST" action="/add">
    Name: <input name="stud_name"><br>
    Address: <input name="stud_address"><br>
    Age: <input name="age"><br>
    <button>Add Student</button>
    </form>

    <h2>Students</h2>
    `;

    results.forEach(student => {
      html += `
      <p>
      <b>${student.stud_name}</b><br>
      ${student.stud_address}<br>
      ${student.age}<br>

      <a href="/edit/${student.stud_id}">Edit</a>
      <a href="/delete/${student.stud_id}">Delete</a>
      </p>
      `;
    });

    html += `</body></html>`;
    res.send(html);
  });
});

// ========================
// ADD
// ========================
app.post("/add", (req, res) => {

  const { stud_name, stud_address, age } = req.body;

  db.query(
    "INSERT INTO students (stud_name, stud_address, age) VALUES (?, ?, ?)",
    [stud_name, stud_address, age],
    (err) => {
      if (err) console.log(err);
      res.redirect("/");
    }
  );
});

// ========================
// EDIT
// ========================
app.get("/edit/:id", (req, res) => {

  db.query(
    "SELECT * FROM students WHERE stud_id=?",
    [req.params.id],
    (err, results) => {

      if (err || !results.length) {
        return res.send("Student not found");
      }

      const s = results[0];

      res.send(`
      <form method="POST" action="/update/${s.stud_id}">
      Name: <input name="stud_name" value="${s.stud_name}"><br>
      Address: <input name="stud_address" value="${s.stud_address}"><br>
      Age: <input name="age" value="${s.age}"><br>
      <button>Update</button>
      </form>
      `);

    }
  );
});

// ========================
// UPDATE
// ========================
app.post("/update/:id", (req, res) => {

  const { stud_name, stud_address, age } = req.body;

  db.query(
    "UPDATE students SET stud_name=?, stud_address=?, age=? WHERE stud_id=?",
    [stud_name, stud_address, age, req.params.id],
    (err) => {
      if (err) console.log(err);
      res.redirect("/");
    }
  );
});

// ========================
// DELETE
// ========================
app.get("/delete/:id", (req, res) => {

  db.query(
    "DELETE FROM students WHERE stud_id=?",
    [req.params.id],
    (err) => {
      if (err) console.log(err);
      res.redirect("/");
    }
  );
});

// ========================
// START SERVER
// ========================
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});