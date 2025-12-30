import app from "../app.js";

const todoMiddleware = (req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
};

export default todoMiddleware;
