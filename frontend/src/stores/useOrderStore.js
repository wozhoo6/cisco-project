import { create } from "zustand";
import axios from "../lib/axios";
import toast from "react-hot-toast";
import { supabase } from "../lib/db";
import { useUserStore } from "./useUserStore";

export const useOrderStore = create((set, get) => ({
  loading: false,
  orders: [],
  channel: null,

  getActiveOrders: async () => {
    set({ loading: true });

    try {
      const res = await axios.get("/order/storeOrders");
      set({ orders: res.data.data });
    } catch (error) {
      const msg =
        error?.response?.data?.message || error?.message || "An error occurred";
      toast.error(msg);
    } finally {
      set({ loading: false });
    }
  },

  getOrderByStatus: async (status) => {
    set({ loading: true });

    try {
      const res = await axios.get(`/order/storeOrders/?status=${status}`);
      set({ orders: res.data.data });
    } catch (error) {
      const msg =
        error?.response?.data?.message || error?.message || "An error occurred";
      toast.error(msg);
    } finally {
      set({ loading: false });
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      await axios.put(`/order/updateStatus/${orderId}`, { status });
    } catch (error) {
      const msg =
        error?.response?.data?.message || error?.message || "An error occurred";
      toast.error(msg);
    }
  },

  subscribeToOrders: () => {
    const user = useUserStore.getState().user;
    const storeId = user?.id;

    const options = {
      event: "*",
      schema: "public",
      table: "orders",
    };

    if (storeId) {
      options.filter = `store_id=eq.${storeId}`;
    }

    const channel = supabase
      .channel("orders-realtime")
      .on("postgres_changes", options, async (payload) => {
        const eventType = payload.eventType || payload.event || payload.type;
        const newRow = payload.new;
        const oldRow = payload.old;

        if (eventType === "INSERT") {
          if (!newRow) return;

          let freshOrder = newRow;
          try {
            const res = await axios.get(
              `/order/getOrderDetails/${newRow.order_id}`,
            );
            const data = res.data?.data;
            if (Array.isArray(data) && data.length) {
              freshOrder = data[0];
            }
          } catch (error) {
            console.warn(
              "Could not fetch full order details for insert event",
              error,
            );
          }

          set((state) => {
            const exists = state.orders.some(
              (o) => o.order_id === freshOrder.order_id,
            );
            if (exists) return {};
            return { orders: [freshOrder, ...state.orders] };
          });
          toast.success("New order received");
          return;
        }

        if (eventType === "UPDATE") {
          if (!newRow) return;
          set((state) => ({
            orders: state.orders.map((order) =>
              order.order_id === newRow.order_id
                ? { ...order, ...newRow }
                : order,
            ),
          }));
          return;
        }

        if (eventType === "DELETE") {
          if (!oldRow) return;
          set((state) => ({
            orders: state.orders.filter((o) => o.order_id !== oldRow.order_id),
          }));
          toast.success("Order removed");
          return;
        }
      })
      .subscribe();

    set({ channel });
  },

  unsubscribeFromOrders: () => {
    const channel = get().channel;
    if (channel) {
      supabase.removeChannel(channel);
    }
  },
}));
