import jwt from "jsonwebtoken";
import { supabase } from "../lib/supabase.js";
import { redis } from "../lib/redis.js";

export const protectRoute = async (req, res, next) => {
  try {
    let accessToken = req.cookies.accessToken;

    if (!accessToken) {
      return res.status(401).json({ message: "Unauthorized - No token" });
    }

    let decoded;

    try {
      // ✅ Try verifying access token
      decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
      // ❌ If expired → attempt refresh
      if (err.name === "TokenExpiredError") {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
          return res
            .status(401)
            .json({ message: "Session expired. Please login again." });
        }

        let decodedRefresh;

        try {
          decodedRefresh = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
          );
        } catch {
          return res.status(401).json({ message: "Invalid refresh token" });
        }

        // ✅ Check Redis
        const storedRefreshToken = await redis.get(
          `refresh_token:${decodedRefresh.userId}`,
        );

        if (storedRefreshToken !== refreshToken) {
          return res.status(401).json({ message: "Refresh token mismatch" });
        }

        // ✅ Generate new access token
        accessToken = jwt.sign(
          { userId: decodedRefresh.userId },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "20min" },
        );

        // ✅ Set new cookie
        res.cookie("accessToken", accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 20 * 60 * 1000,
        });

        decoded = { userId: decodedRefresh.userId };
      } else {
        return res.status(401).json({ message: "Invalid token" });
      }
    }

    // ✅ Fetch user
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", decoded.userId)
      .maybeSingle();

    if (error || !data) {
      return res.status(404).json({ message: "User not found" });
    }

    delete data.password_hash;

    req.user = data;

    next();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const adminRoute = async (req, res, next) => {
  if (req.user && req.user.role === "admin") next();
  else return res.status(403).json({ message: "Requires admin account" });
};
