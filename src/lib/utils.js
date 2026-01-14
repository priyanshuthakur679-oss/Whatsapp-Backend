import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // true only in production
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // "Lax" for dev, "None" for production
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return token;
};
