import express from "express";
import todoRoutes from "./routes/todo-routes.js";
import todoMiddleware from "./middlewares/logger.js";
import { errorMiddleware } from "./middlewares/error.js";

const app = express();

app.use(express.json());

app.use("/todos", todoMiddleware);

app.use("/todos", todoRoutes);

app.use(errorMiddleware);

export default app;
