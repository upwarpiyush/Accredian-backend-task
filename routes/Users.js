// Import the required modules
const express = require("express")
const router = express.Router()

// Import the required controllers and middleware functions
const {
  login,
  signup,
} = require("../controllers/Auth")

const { auth } = require("../middlewares/auth")

// Routes for Login, Signup, and Authentication

// Route for user login
router.post("/login", login)

// Route for user signup
router.post("/signup", signup)


// Export the router for use in the main application
module.exports = router