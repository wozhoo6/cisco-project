const errorMiddleware = (err, req, res, next) => {
  console.error(err);

  // Default values
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "Server Error";

  // Duplicate key (Mongo-style OR Supabase unique violation)
  if (err.code === 11000 || err.code === "23505") {
    statusCode = 409;
    message = "Duplicate field value entered";
  }

  //  Invalid ID / bad request
  if (err.name === "CastError") {
    statusCode = 404;
    message = "Resource not found";
  }

  // Validation errors (Mongoose-style or custom)
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  // Supabase/Postgres error fallback
  if (err.code && typeof err.code === "string" && err.details) {
    message = err.message || "Database error";
  }

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};

export default errorMiddleware;
