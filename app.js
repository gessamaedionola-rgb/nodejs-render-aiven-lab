const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

// DATABASE CONNECTION
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

db.connect((err) => {
  if (err) {
    console.log("Database connection failed:", err);
  } else {
    console.log("Connected to database");
  }
});

// MAIN PAGE
app.get("/", (req, res) => {

  db.query("SELECT * FROM students", (err, results) => {

    if (err) {
      console.log("Query error:", err);
      return res.send("Database query failed");
    }

    if (!results) {
      results = [];
    }

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

    html += `
</body>
</html>
`;

    res.send(html);

  });

});

// ADD STUDENT
app.post("/add", (req, res) => {

  const { stud_name, stud_address, age } = req.body;

  db.query(
    "INSERT INTO students (stud_name, stud_address, age) VALUES (?, ?, ?)",
    [stud_name, stud_address, age],
    (err) => {
      if (err) {
        console.log(err);
        return res.send("Insert failed");
      }

      res.redirect("/");
    }
  );

});

// DELETE STUDENT
app.get("/delete/:id", (req, res) => {

  const id = req.params.id;

  db.query("DELETE FROM students WHERE stud_id = ?", [id], (err) => {
    if (err) {
      console.log(err);
      return res.send("Delete failed");
    }

    res.redirect("/");
  });

});

// EDIT PAGE
app.get("/edit/:id", (req, res) => {

  const id = req.params.id;

  db.query("SELECT * FROM students WHERE stud_id = ?", [id], (err, results) => {

    if (err) {
      console.log(err);
      return res.send("Error loading student");
    }

    const student = results[0];

    let html = `
<html>
<body>

<h2>Edit Student</h2>

<form method="POST" action="/update/${student.stud_id}">
Name: <input name="stud_name" value="${student.stud_name}"><br>
Address: <input name="stud_address" value="${student.stud_address}"><br>
Age: <input name="age" value="${student.age}"><br>
<button>Update</button>
</form>

</body>
</html>
`;

    res.send(html);

  });

});

// UPDATE STUDENT
app.post("/update/:id", (req, res) => {

  const id = req.params.id;
  const { stud_name, stud_address, age } = req.body;

  db.query(
    "UPDATE students SET stud_name=?, stud_address=?, age=? WHERE stud_id=?",
    [stud_name, stud_address, age, id],
    (err) => {
      if (err) {
        console.log(err);
        return res.send("Update failed");
      }

      res.redirect("/");
    }
  );

});

// SERVER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});