import { supabase } from "../lib/supabase.js";
import { redis } from "../lib/redis.js";
import { v4 as uuidv4 } from "uuid";

export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, status } = req.body;

    let image_url = null;

    if (req.file) {
      const file = req.file;
      const fileName = `${uuidv4()}-${file.originalname}`;

      const { error: uploadError } = await supabase.storage
        .from("product_images")
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from("product_images")
        .getPublicUrl(fileName);

      image_url = data.publicUrl;
    }

    const { data: product, error: dbError } = await supabase
      .from("products")
      .insert([
        {
          name,
          description,
          price: parseFloat(price),
          image_url,
          status: status || "active",
        },
      ])
      .select()
      .single();

    if (dbError) {
      throw dbError;
    }

    const cacheKey = "products";

    const cachedProducts = await redis.get(cacheKey);

    if (cachedProducts) {
      const parsed = JSON.parse(cachedProducts);
      parsed.push(product);

      await redis.set(cacheKey, JSON.stringify(parsed));
    } else {
      const dbProducts = await supabase
        .from("products")
        .select("*")
        .eq("status", "active");

      await redis.set(cacheKey, JSON.stringify(dbProducts.data));
    }

    return res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (req, res, next) => {
  try {
    const cachedProducts = await redis.get("products");
    let products = [];

    if (!cachedProducts) {
      const dbProducts = await supabase
        .from("products")
        .select("*")
        .eq("status", "active");

      await redis.set("products", JSON.stringify(dbProducts.data));

      products = dbProducts.data;
    } else {
      products = JSON.parse(cachedProducts);
    }

    return res.status(201).json({
      products,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const productId = req.params.product_id;

    // Update product status to archived
    const { data: updatedProduct, error } = await supabase
      .from("products")
      .update({ status: "archived" })
      .eq("product_id", productId) // make sure your column is correct (id vs product_id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Optional: check if product exists
    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await redis.del("products");

    return res.status(200).json({
      success: true,
      message: "Product archived successfully",
      product: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

export const editProduct = async (req, res, next) => {
  try {
    const productId = req.params.product_id;

    const updateData = {...req.body}

    if (updateData.price) {
        updateData.price = parseFloat(updateData.price)
    }

    const { data: updatedProduct, error } = await supabase
      .from("products")
      .update(updateData)
      .eq("product_id", productId) // make sure your column is correct (id vs product_id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Optional: check if product exists
    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await redis.del("products");

    return res.status(200).json({
      success: true,
      message: "Product archived successfully",
      product: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};
