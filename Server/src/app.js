const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/user");
app.use(express.json());
app.use(cookieParser());
PORT = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.send("server is running");
});

app.use("/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`App is listening at port ${PORT}`);
});
