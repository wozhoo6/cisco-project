import React from "react";
import axios from "../lib/axios";
import toast from "react-hot-toast";
import { create } from "zustand";

export const useOrderStore = create((set, get) => ({
  loading: false,
  checkingAuth: true,
  orders: [],

  getActiveOrders: async () => {
    set({ loading: true });

    try {
      const res = await axios.get("/order/storeOrders");
      console.log(res.data)
      set({orders: res.data.data})
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "An error occurred";
        console.log(error)
      toast.error(msg);
    }finally {
        set({loading: false})
    }
  },
}));
