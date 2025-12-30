import express from "express";
import {
  createNewTodo,
  deleteTodo,
  getSingleTodo,
  getTodos,
  updateTodo,
} from "../controllers/todo-controller.js";

const router = express.Router();

router.get("/", getTodos);

router.get("/:id", getSingleTodo);

router.post("/", createNewTodo);

router.put("/:id", updateTodo);

router.delete("/:id", deleteTodo);

export default router;
