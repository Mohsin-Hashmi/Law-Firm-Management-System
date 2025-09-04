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
const cors = require("cors");
const { User, Role  } = require("./models");
const { where } = require("sequelize");
const bcrypt = require("bcryptjs");
const path = require("path");

// Serve static files from uploads folder
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
PORT = process.env.PORT || 4000;
// ====Creating the Super Admin=====
const createSuperAdmin = async () => {
  const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL;
  const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD;
  const SUPER_ADMIN_NAME = "Super Admin";

  try {
    // 1. Ensure the "Super Admin" role exists
    let superAdminRole = await Role.findOne({ where: { name: "Super Admin" } });
    if (!superAdminRole) {
      superAdminRole = await Role.create({ name: "Super Admin" });
      console.log("Super Admin role created");
    }

    // 2. Check if super admin user exists
    const existingAdmin = await User.findOne({
      where: { email: SUPER_ADMIN_EMAIL },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);

      await User.create({
        name: SUPER_ADMIN_NAME,
        email: SUPER_ADMIN_EMAIL,
        password: hashedPassword,
        roleId: superAdminRole.id, // ✅ use roleId instead of role string
      });

      console.log(" Super Admin user created");
    } else {
      console.log("Super Admin already exists");
    }
  } catch (error) {
    console.error(" Error creating Super Admin:", error);
  }
};

app.use((req, res, next) => {
  const host = req.headers.host; // e.g., firm1.localhost:3000
  const parts = host.split("."); // ["firm1", "localhost:3000"]
  const subdomain = parts[0]; // first part is the subdomain
  req.firmSubdomain = subdomain;
  next();
});

// =====Routes=====

app.get("/", (req, res) => {
  res.send("server is running");
});

app.use("/auth", authRoutes);
app.use("/api/superadmin", superAdminRoutes);
app.use("/api/firm-admin", adminRoute);
app.use("/api/firm-admin", clientRoute);
app.use("/api/firm-admin", caseRoute);
app.use("/api/lawyers", lawyerRoutes);
// =====Start Server====
app.listen(PORT, async () => {
  console.log(`App is listening at port ${PORT}`);
  await createSuperAdmin();
});
