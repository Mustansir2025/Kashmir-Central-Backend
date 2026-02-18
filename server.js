require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
console.log("Mongo URI:", process.env.MONGO_URI);
connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);

// Serve uploads
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/admin/auth", require("./routes/admin/auth"));

app.use("/api/issues", require("./routes/issues.js"));
app.use("/api/admin/issues", require("./routes/admin/issues.js"));

app.use("/api/reviews", require("./routes/reviews.js"));
app.use("/api/admin/reviews", require("./routes/admin/reviews.js"));

app.use("/api/articles", require("./routes/articles"));
app.use("/api/admin/articles", require("./routes/admin/articles"));

app.use("/api/admin/news", require("./routes/admin/news"));
app.use("/api/news", require("./routes/news.js"));

const editorialAdminRoutes = require("./routes/admin/editorialAdminRoutes");
const editorialRoutes = require("./routes/editorialRoutes");

app.use("/api/admin/editorials", editorialAdminRoutes);
app.use("/api/editorials", editorialRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
