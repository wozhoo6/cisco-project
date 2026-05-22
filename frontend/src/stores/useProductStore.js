import React from "react";
import axios from "../lib/axios";
import toast from "react-hot-toast";
import { create } from "zustand";

export const useProductStore = create((set, get) => ({
  user: null,
  loading: false,
  products: [],

  fetchProducts: async (userData) => {
    set({ loading: true });

    try {
      const res = await axios.get("/product");
      console.log()
      set({ products: res.data.data  , loading: false });
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
}));
