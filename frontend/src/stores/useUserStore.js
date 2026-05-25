import React from "react";
import axios from "../lib/axios";
import toast from "react-hot-toast";
import { create } from "zustand";

export const useUserStore = create((set, get) => ({
  user: null,
  loading: false,
  checkingAuth: true,
  sellers: [],
  storeIdentifier: null,

  login: async (userData) => {
    set({ loading: true });

    try {
      const { username, password } = userData;
      const res = await axios.post("/auth/login", { username, password });
      set({ user: res.data.data, loading: false });
      toast.success(`Welcome ${res.data.data.username}`);
    } catch (error) {
      set({ loading: false });
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "An error occurred";
      toast.error(msg);
    }
  },


  checkAuth: async () => {
    set({ checkingAuth: true });

    try {
      const res = await axios.get("/auth/checkAuth");
      const identRes = await axios.get("/auth/fetchStoreIdentfier");
      set({ user: res.data.data, storeIdentifier:identRes.data.data[0].id, checkingAuth: false });
    } catch (error) {
      set({ user: null, checkingAuth: false });
    }
  },

  fetchSellerName: async (sellerId) => {
    set({ checkingAuth: true });

    const res = await axios.get(`/auth/seller/${sellerId}`);
    const seller = res.data.data;
    return seller.name;
  },

  logout: async () => {
    await axios.post("/auth/logout");
    set({ user: null });
  },

  fetchAllSeller: async () => {
    set({ loading: true });

    try {
      const res = await axios.get("/auth/seller/all");
      set({ sellers: res.data.data });
    } catch (error) {
      set({ loading: false });
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "An error occurred";
      toast.error(error?.response?.data?.message);
    } finally {
      set({ loading: false });
    }
  },
}));
