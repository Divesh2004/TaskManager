// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//     minlength: 3,
//     maxLength: 30,
//   },
//   email: {
//     type: String,
//     required: true,
//     minlength: 3,
//     maxLength: 200,
//     unique: true,
//   },
//   password: {
//     type: String,
//     required: true,
//     minlength: 6,
//     maxLength: 1024,
//   },
// });

// const User = mongoose.model("User", userSchema);

// exports.User = User;
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  provider: String,         // "google", "github", "facebook"
  providerId: String,       // ID from OAuth provider
  name: String,
  email: String,
  avatar: String
});

module.exports = mongoose.model("User", userSchema);
