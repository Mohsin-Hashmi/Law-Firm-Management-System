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
  } else if (!validator.isEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Email format is invalid",
    });
  } 
  return null;
};

module.exports = {
  UserSignUpValidation,
  UserLoginInValidation,
};
