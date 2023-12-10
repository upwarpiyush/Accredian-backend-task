const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
});

exports.signup = async (req, res) => {
  try {
    const {
      userName,
      email,
      password,
      confirm_password,
    } = req.body;

    if (!userName || !email || !password || !confirm_password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password !== confirm_password) {
      return res.status(400).json({
        success: false,
        message: "Password and Confirm Password do not match. Please try again.",
      });
    }

    // Check if user already exists
    const [rows] = await pool.query('SELECT email FROM users WHERE email = ?', [email]);

    if (rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User already exists. Please sign in to continue.",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("This is hashed password ....", hashedPassword)

    // Insert user into the database
    const [results] = await pool.query('INSERT INTO users SET ?', [{ userName, email, password: hashedPassword}]);

    return res.status(200).json({
      success: true,
      results,
      message: "User registered successfully!!!",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "User cannot be registered. Please try again.",
    });
  }
};


exports.login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Please Fill up All the Required Fields",
        });
      }
  
      // Find user with provided email
      const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      const user = rows[0];
  
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User is not Registered with Us. Please SignUp to Continue",
        });
      }
  
      // Compare Password
      if (await bcrypt.compare(String(password), String(user.password))) {
        const token = jwt.sign(
          { email: user.email, id: user.id, accountType: user.accountType },
          process.env.JWT_SECRET,
          {
            expiresIn: "24h",
          }
        );

        // Remove sensitive information from the user object
        user.password = undefined;
  
        // Set cookie for token and return success response
        const options = {
          expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          httpOnly: true,
        };
        res.cookie("token", token, options).status(200).json({
          success: true,
          token,
          user,
          message: "User Login Success",
        });
      } else {
        return res.status(401).json({
          success: false,
          message: "Password is incorrect",
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Login Failure. Please Try Again",
      });
    }
  };