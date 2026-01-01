import {
  createNewTodoService,
  deleteTodoService,
  getTodoByIdService,
  getTodosService,
  updateTodoService,
} from "../services/todo-service.js";
import { asyncHandler } from "../utils/async-handler.js";

export const getTodos = asyncHandler(async (req, res) => {
  const page = Number(req.query?.page ?? "1");
  const limit = Math.min(50, Number(req.query?.limit ?? "10"));

  const offset = (page - 1) * limit;

  const result = await getTodosService({ limit, offset });

  return res.status(200).json({ data: result });
});

export const getSingleTodo = asyncHandler(async (req, res) => {
  const todo = await getTodoByIdService(Number(req.params.id));

  res.json(todo);
});

export const createNewTodo = asyncHandler(async (req, res) => {
  const { title, status } = req.body;

  const newTodo = await createNewTodoService({ title, status });
  return res.status(201).json({ data: newTodo });
});

export const updateTodo = asyncHandler(async (req, res) => {
  const param = req.params.id;
  const data = req.body;

  await updateTodoService(Number(param), data);
  res.status(200).json({ message: `ID: ${param} successfully updated` });
});

export const deleteTodo = asyncHandler(async (req, res) => {
  const param = req.params.id;

  await deleteTodoService(Number(param));
  res.status(200).json({ message: `Todo successfully deleted` });
});
