import { supabase } from "../lib/supabase.js";
import { redis } from "../lib/redis.js";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const generateToken = (userId) => {
  // get token secrets from .env file
  // no expiresIn so tokens do not expire automatically
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET);
  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET);

  return { accessToken, refreshToken };
};

// storing the refresh token in redis cache indefinitely for kiosk-style sessions
const storeRefreshToken = async (userId, refreshToken) => {
  await redis.set(`refresh_token:${userId}`, refreshToken);
};

const setCookies = (res, accessToken, refreshToken) => {
  const TEN_YEARS = 10 * 365 * 24 * 60 * 60 * 1000;

  const options = {
    httpOnly: true,
    secure: false, // ✅ dev only
    sameSite: "lax", // ✅ works on HTTP
    maxAge: TEN_YEARS,
  };

  res.cookie("accessToken", accessToken, options);
  res.cookie("refreshToken", refreshToken, options);
};

export const createStore = async (req, res, next) => {
  try {
    const { username, password, address = null } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          username,
          password_hash: hashedPassword,
          address,
        },
      ])
      .select("username");

    if (error) {
      if (error.code === "23505") {
        return res.status(409).json({
          message: "Username already exists",
        });
      }
      return next(error);
    }

    return res.status(201).json({
      message: "Store account created successfully",
      user: data[0],
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .maybeSingle(); // safer than .single()

    if (!data) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    const isValid = await bcrypt.compare(password, data.password_hash);

    if (!isValid) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    delete data.password_hash;

    const { accessToken, refreshToken } = generateToken(data.id);

    await storeRefreshToken(data.id, refreshToken);

    setCookies(res, accessToken, refreshToken);

    return res.status(200).json({
      data: data,
      message: "User logged in",
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const refreshToken = res.cookie.refreshToken;

    if (refreshToken) {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
      );
      await redis.del(`refresh_token:${decoded.userId}`);
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.send({ message: "User logged out successfully." });
  } catch (error) {
    console.error(error.message);
    next(error);
  }
};

export const refreshAccessToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken)
      return res.status(401).json({ message: "No refresh token provided" });

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const storedRefreshToken = await redis.get(
      `refresh_token:${decoded.userId}`,
    );

    if (storedRefreshToken != refreshToken)
      return res.status(401).json({ message: "Invalid refresh token." });

    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.ACCESS_TOKEN_SECRET,
    );

    const TEN_YEARS = 10 * 365 * 24 * 60 * 60 * 1000;
    res.cookie("accessToken", accessToken, {
      httpOnly: true, // prevent XSS attacks, cross site scripting attack
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict", // prevents CSRF attack, cross-site request forgery attack
      maxAge: TEN_YEARS,
    });

    res.send({ message: "Token refreshed succefully." });
  } catch (error) {
    console.error(error.message);
    next(error);
  }
};

export const checkAuth = async (req, res, next) => {
  try {
    res.send({ data: req.user });
  } catch (error) {
    next(error);
  }
};

export const fetchStoreIdentifier = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("store_identifiers")
      .select("*")
      .eq("store_id", req.user.id);

    if (error) throw error;

    res.send({
      data: data,
    });
  } catch (error) {
    next(error);
  }
};
