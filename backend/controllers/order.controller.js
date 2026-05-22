import { supabase } from "../lib/supabase.js";

export const createOrder = async (req, res, next) => {
  try {
    const { items, customer_name, order_type, store_id } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Invalid payload: items required",
      });
    }

    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const { data: product, error } = await supabase
        .from("products")
        .select("product_id, price")
        .eq("product_id", item.item_id)
        .eq("status", "active")
        .single();

      if (error || !product) {
        return res.status(404).json({
          message: `Item not found: ${item.item_id}`,
        });
      }

      const itemTotal = product.price * item.quantity;
      total += itemTotal;

      orderItems.push({
        item_id: product.product_id,
        quantity: item.quantity,
      });
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        total,
        customer_name,
        store_id,
        status: "pending",
        order_type,
      })
      .select("*")
      .maybeSingle();

    if (orderError) throw orderError;

    const displayId = `${order_type}-${String(order.order_id).padStart(6, "0")}`;

    await supabase
      .from("orders")
      .update({ display_id: displayId })
      .eq("order_id", order.order_id);

    const orderDetails = orderItems.map((item) => ({
      order_id: order.order_id,
      item_id: item.item_id,
      quantity: item.quantity,
    }));

    const { error: detailsError } = await supabase
      .from("order_details")
      .insert(orderDetails);

    if (detailsError) throw detailsError;

    return res.status(201).json({
      success: true,
      displayId,
    });
  } catch (error) {
    next(error);
  }
};

export const getStoreOrders = async (req, res, next) => {
  try {
    const storeId = req.user.id;
    const status = req.query.status || null;

    let qry = supabase
      .from("orders")
      .select(
        `
        *,
        order_details (
          item_id,
          quantity, 
          product_details: products(
            name, 
            price
          )
        )
      `,
      )
      .eq("store_id", storeId)
      .order("created_at", { ascending: true });

    if (status) {
      qry = qry.eq("status", status);
    } else {
      qry = qry.not("status", "in", "(completed,cancelled)");
    }

    const { data: orders, error } = await qry;

    if (error) throw error;

    return res.status(200).json({
      data: orders || [],
    });
  } catch (error) {
    next(error);
  }
};


export const updateOrderStatus = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;
    const status = req.body.status;

    const allowedStatus = [
      "pending",
      "paid",
      "preparing",
      "ready",
      "completed",
      "cancelled",
    ];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        message: "Invalid status value",
      });
    }

    const { data: order, error } = await supabase
      .from("orders")
      .update({
        status: status,
      })
      .eq("order_id", orderId)
      .select("display_id")
      .maybeSingle();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: `${order.display_id} updated to ${status}`,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderDetails = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;

    const { data: order, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_details (
          item_id,
          quantity, 
          product_details: products(
            name, 
            price
          )
        )
      `,
      )
      .eq("order_id", orderId);

    if (error) throw error;

    return res.status(200).json({
      data: order || [],
    });
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await supabase;
  } catch (error) {
    next(error);
  }
};
