// errorHandlerMiddleware.js
import http from "http";
import { createHash } from "crypto";

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const timestamp = new Date().toISOString();
  const status = err.status || 500;
  const error = http.STATUS_CODES[status] || "Internal Server Error";
  const message = err.message || "An error occurred";
  const path = req.path;

  let referenceId = null;
  if (status == 500) {
    referenceId = createHash("sha256").update(message).digest("hex");
    console.error(`Reference ID: ${referenceId} (${message})`);
  }

  res.status(status);

  res.json({
    method: req.method,
    timestamp,
    status,
    error,
    message: `Reference ID: ${referenceId}` || message,
    path,
  });
}

export default errorHandler;
