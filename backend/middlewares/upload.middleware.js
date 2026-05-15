import multer from "multer";

const storage = multer.memoryStorage(); // store file in memory (needed for Supabase)

export const upload = multer({
  storage,
});