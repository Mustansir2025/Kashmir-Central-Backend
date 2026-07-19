require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const cookieParser = require("cookie-parser");

connectDB();

const app = express();

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    if (
      origin === "http://localhost:3000" ||
      origin === "https://www.kashmir-central.com" ||
      origin === "https://kashmir-central.com" ||
      origin.endsWith(".vercel.app")
    ) {
      return callback(null, true);
    }

    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


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

app.use("/api/admin/logout", require("./routes/admin/logout"));

const editorialAdminRoutes = require("./routes/admin/editorialAdminRoutes");
const editorialRoutes = require("./routes/editorialRoutes");

app.use("/api/admin/editorials", editorialAdminRoutes);
app.use("/api/editorials", editorialRoutes);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  server.setTimeout(5 * 60 * 1000);
});
