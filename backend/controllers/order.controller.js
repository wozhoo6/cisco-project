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

    const { data: storeIdentifierRes, error: storeIdentError } = await supabase
      .from("store_identifiers")
      .select("id")
      .eq("store_id", storeId);

    if (storeIdentError) throw error;

    const storeIdentifier = storeIdentifierRes[0].id;

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
      .eq("store_id", storeIdentifier)
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
    const filters = req.query;

    let query = supabase.from("orders").select(`
    *,
    store_name:store_identifiers (
      user:users (
        username
      )
    )
  `);

    // ✅ Apply filters dynamically
    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    if (filters.store_id) {
      query = query.eq("store_id", filters.store_id);
    }

    if (filters.customer_name) {
      query = query.ilike("customer_name", `%${filters.customer_name}%`);
    }

    if (filters.from_date) {
      const fromDate = new Date(filters.from_date);
      fromDate.setHours(0, 0, 0, 0);

      query = query.gte("created_at", fromDate.toISOString());
    }

    if (filters.to_date) {
      const toDate = new Date(filters.to_date);
      toDate.setHours(23, 59, 59, 999);

      query = query.lte("created_at", toDate.toISOString());
    }

    // Pagination

    const limit = filters.limit ? parseInt(filters.limit) : 10;
    const offset = filters.offset ? parseInt(filters.offset) : 0;

    query = query.range(offset, offset + limit - 1);

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) throw error;

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getTotalStatusCounts = async (req, res, next) => {
  try {
    const filters = req.query;

    let query = supabase.from("orders").select("status", { count: "exact" });

    if (filters.store_id) {
      query = query.eq("store_id", filters.store_id);
    }

    if (filters.from_date) {
      const fromDate = new Date(filters.from_date);
      fromDate.setHours(0, 0, 0, 0);

      query = query.gte("created_at", fromDate.toISOString());
    }

    if (filters.to_date) {
      const toDate = new Date(filters.to_date);
      toDate.setHours(23, 59, 59, 999);

      query = query.lte("created_at", toDate.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;

    const counts = data.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: counts,
    });
  } catch (error) {
    next(error);
  }
};
