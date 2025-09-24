const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/user");
const superAdminRoutes = require("./routes/superAdmin");
const lawyerRoutes = require("./routes/lawyer");
const adminRoute = require("./routes/admin");
const clientRoute = require("./routes/client");
const caseRoute = require("./routes/case");
const roleRoutes = require("./routes/role");
const cors = require("cors");
const { User, Role, sequelize } = require("./models"); // ✅ import sequelize
const bcrypt = require("bcryptjs");
const path = require("path");

// Serve static files from uploads folder
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const allowedOrigins = [
  "https://legal-law-firm-management-system.vercel.app", // production
  "http://localhost:3000", // local development
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow requests with no origin
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

const PORT = process.env.PORT || 4000;

// ====Creating the Super Admin=====
const createSuperAdmin = async () => {
  const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL;
  const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD;
  const SUPER_ADMIN_NAME = "Super Admin";

  try {
    let superAdminRole = await Role.findOne({ where: { name: "Super Admin" } });
    if (!superAdminRole) {
      superAdminRole = await Role.create({ name: "Super Admin" });
      console.log("✅ Super Admin role created");
    }

    const existingAdmin = await User.findOne({
      where: { email: SUPER_ADMIN_EMAIL },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);
      await User.create({
        name: SUPER_ADMIN_NAME,
        email: SUPER_ADMIN_EMAIL,
        password: hashedPassword,
        roleId: superAdminRole.id,
      });

      console.log("✅ Super Admin user created");
    } else {
      console.log("ℹ️ Super Admin already exists");
    }
  } catch (error) {
    console.error("❌ Error creating Super Admin:", error);
  }
};

// Middleware to extract subdomain
app.use((req, res, next) => {
  const host = req.headers.host; // e.g., firm1.localhost:3000
  const parts = host.split(".");
  req.firmSubdomain = parts[0]; // first part is the subdomain
  next();
});

// =====Routes=====
app.get("/", (req, res) => {
  res.send("server is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/super-admin", superAdminRoutes);
app.use("/api/firm-admin", adminRoute);
app.use("/api/firm-admin", clientRoute);
app.use("/api/firm-admin", caseRoute);
app.use("/api/lawyers", lawyerRoutes);
app.use("/api/roles", roleRoutes);

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Unhandled Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: err.message,
  });
});

// =====Start Server====
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log(" Database connected successfully");

    app.listen(PORT, "0.0.0.0", async () => {
      console.log(` App is listening at port ${PORT}`);
      await createSuperAdmin();
    });
  } catch (error) {
    console.error(" Unable to connect to the database:", error);
    process.exit(1); // stop the app if DB connection fails
  }
};

startServer();
