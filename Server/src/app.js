const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/user");
const superAdminRoutes = require("./routes/superAdmin")
const cors = require("cors");
const { User } = require("./models");
const { where } = require("sequelize");
const bcrypt = require("bcryptjs");
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
PORT = process.env.PORT || 4000;
// ====Creating the Super Admin=====
const createSuperAdmin = async () => {
  const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL;
  const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD;
  const SUPER_ADMIN_NAME = "Super Admin";
  try {
    const existingAdmin = await User.findOne({
      where: {
        email: SUPER_ADMIN_EMAIL,
      },
    });
    const hashedPassword = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);
    if (!existingAdmin) {
      await User.create({
        name: SUPER_ADMIN_NAME,
        email: SUPER_ADMIN_EMAIL,
        password: hashedPassword,
        role: "Super Admin",
      });
      console.log("Super Admin created");
    } else {
      console.log("Super Admin already exists");
    }
  } catch (error) {
    console.error("Error creating Super Admin:", error);
  }
};

// =====Routes=====

app.get("/", (req, res) => {
  res.send("server is running");
});

app.use("/auth", authRoutes);
app.use("/auth", superAdminRoutes);
// =====Start Server====
app.listen(PORT, async () => {
  console.log(`App is listening at port ${PORT}`);
  await createSuperAdmin();
});
