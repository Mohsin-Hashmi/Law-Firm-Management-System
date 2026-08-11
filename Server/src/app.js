const dotenv = require("dotenv");
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local' });
}
dotenv.config();
const express = require("express");
const app = express();
// Trust reverse proxy (Nginx/ALB) so secure cookies and protocol detection work
app.set("trust proxy", 1);

const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/user");
const superAdminRoutes = require("./routes/superAdmin");
const lawyerRoutes = require("./routes/lawyer");
const adminRoute = require("./routes/admin");
const clientRoute = require("./routes/client");
const caseRoute = require("./routes/case");
const roleRoutes = require("./routes/role");
const stripeRoute = require("./routes/stripe");
const userProfileRouter = require("./routes/user-profile");
const cors = require("cors");
const { User, Role, sequelize } = require("./models");
const bcrypt = require("bcryptjs");
const path = require("path");

// ====== Middleware ======
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const allowedOrigins = [
  process.env.FRONTEND_ORIGIN, // e.g., https://your-domain
  "https://legal-law-firm-management-system.vercel.app",
  "https://northmanlegal.vercel.app",
  "http://localhost:3000", // local development
].filter(Boolean);

// Apply CORS to APIs to handle CORS
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow requests with no origin

      // Check if origin is localhost (including subdomains and any port)
      const isLocalhost = origin.match(/^http:\/\/(?:[a-zA-Z0-9-]+\.)*localhost(?::\d+)?$/) ||
        origin.match(/^http:\/\/127\.0\.0\.1(?::\d+)?$/);

      if (isLocalhost || allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

//  Serve static files from uploads with CORS
app.use(
  "/uploads",
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      const isLocalhost = origin.match(/^http:\/\/(?:[a-zA-Z0-9-]+\.)*localhost(?::\d+)?$/) ||
        origin.match(/^http:\/\/127\.0\.0\.1(?::\d+)?$/);
      if (isLocalhost || allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET"],
    credentials: true,
  }),
  express.static(path.join(__dirname, "../uploads"))
);

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.status(200).json({ success: true, status: "ok" });
});

app.get("/health", (req, res) => {
  res.status(200).json({ success: true, status: "healthy" });
});

// ====Creating the Super Admin=====
const createSuperAdmin = async () => {
  const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL;
  const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD;
  const SUPER_ADMIN_NAME = "Super Admin";

  try {
    if (!SUPER_ADMIN_EMAIL || !SUPER_ADMIN_PASSWORD) {
      console.warn("Super Admin env vars are not set; skipping bootstrap user.");
      return;
    }

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
app.use("/auth", authRoutes);
app.use("/super-admin", superAdminRoutes);
app.use("/firm-admin", adminRoute);
app.use("/firm-admin", clientRoute);
app.use("/firm-admin", caseRoute);
app.use("/lawyers", lawyerRoutes);
app.use("/roles", roleRoutes);
app.use("/stripe", stripeRoute);
app.use("/user-profile", userProfileRouter);

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
