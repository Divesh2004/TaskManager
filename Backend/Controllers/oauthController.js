const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { getAccessToken, getUserProfile } = require("../services/oauth");

const createToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const oauthCallback = async (req, res) => {
  const { provider } = req.params;
  const { code } = req.query;

  try {
    const accessToken = await getAccessToken(provider, code);
    const profile = await getUserProfile(provider, accessToken);

    let user = await User.findOne({ providerId: profile.id, provider });

    if (!user) {
      user = await User.create({
        provider,
        providerId: profile.id,
        name: profile.name,
        email: profile.email,
        avatar: profile.avatar
      });
    }

    const token = createToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect("http://localhost:3000/dashboard");
  } catch (err) {
  console.error("OAuth error:", err); // Show full error object
  res.status(500).json({ message: "OAuth failed", error: err.message });
}

};

module.exports = { oauthCallback };
