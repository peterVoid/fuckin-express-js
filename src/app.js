import cookieParser from "cookie-parser";
import "dotenv/config";
import express from "express";
import helmet from "helmet";
import { pool } from "./db/index.js";
import { errorMiddleware } from "./middlewares/error.js";
import todoMiddleware from "./middlewares/logger.js";
import authRoutes from "./routes/auth-routes.js";
import todoRoutes from "./routes/todo-routes.js";
import userRoutes from "./routes/user-routes.js";

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        scriptSrc: ["'none'"],
        styleSrc: ["'none'"],
        imgSrc: ["'none'"],
        connectSrc: ["'self'"],
        frameAncestors: ["'none'"],
        baseUri: ["'none'"],
        formAction: ["'self'"],
      },
    },
  })
);
app.use(cookieParser());
app.use(express.json());

app.get("/health", async (req, res) => {
  const result = await pool.query("SELECT 1");
  res.json({ db: "Connected", result: result.rows });
});

app.use("/todos", todoMiddleware);

app.use("/todos", todoRoutes);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);

app.use(errorMiddleware);

export default app;
