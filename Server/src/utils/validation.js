const validator = require("validator");
const UserSignUpValidation = (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  } else if (!validator.isEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Email format is invalid",
    });
    // } else if (!validator.isStrongPassword(password)) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Password is weak make a strong password",
    //   });
    // } else if (password.legth < 5) {
    return res.status(400).json({
      success: false,
      message: "password should atleast five characters",
    });
  }
  return null;
};

const UserLoginInValidation = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Email format is invalid",
    });
  }
  return null;
};

const FirmValidation = (req, res) => {
  const {
    name,
    email,
    phone,
    subscription_plan,
    max_users,
    max_cases,
    status,
    trial_ends_at,
  } = req.body;

  if (!name || !email || !phone || !subscription_plan || !status) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Email format is invalid",
    });
  }
  if (!validator.isMobilePhone(phone + "", "any")) {
    return res.status(400).json({
      success: false,
      message: "Invalid phone number",
    });
  }
  const allowedPlans = ["Free", "Basic", "Premium"];
  if (!allowedPlans.includes(subscription_plan)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid subscription plan" });
  }

  const allowedStatus = ["Active", "Suspended", "Expired"];
  if (!allowedStatus.includes(status)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid status value" });
  }

  if (max_users && !validator.isInt(max_users.toString(), { min: 1 })) {
    return res.status(400).json({
      success: false,
      message: "Max users must be a positive integer",
    });
  }
  if (max_cases && !validator.isInt(max_cases.toString(), { min: 1 })) {
    return res.status(400).json({
      success: false,
      message: "Max cases must be a positive integer",
    });
  }

  if (trial_ends_at && !validator.isDate(trial_ends_at.toString())) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid trial end date" });
  }
};
module.exports = {
  UserSignUpValidation,
  UserLoginInValidation,
  FirmValidation,
};
