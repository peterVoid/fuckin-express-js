import { todos } from "../data/todo.js";
import {
  createNewTodoService,
  deleteTodoService,
  getTodoByIdService,
  updateTodoService,
} from "../services/todo-service.js";
import { asyncHandler } from "../utils/async-handler.js";

export const getTodos = (req, res) => {
  return res.status(200).json({ data: todos });
};

export const getSingleTodo = asyncHandler(async (req, res) => {
  const todo = await getTodoByIdService(Number(req.params.id));
  res.json(todo);
});

export const createNewTodo = asyncHandler(async (req, res) => {
  const body = req.body;

  const newTodo = await createNewTodoService(body);
  return res.status(201).json({ data: newTodo });
});

export const updateTodo = async (req, res, next) => {
  const param = req.params.id;
  const body = req.body;

  try {
    await updateTodoService(Number(param), body);
    res.status(200).json({ message: `ID: ${param} successfully updated` });
  } catch (error) {
    next(error);
  }
};

export const deleteTodo = async (req, res, next) => {
  const param = req.params.id;

  try {
    await deleteTodoService(Number(param));
    res.status(200).json({ message: `Todo successfully deleted` });
  } catch (error) {
    next(error);
  }
};
