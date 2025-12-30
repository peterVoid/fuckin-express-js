import { todos } from "../data/todo.js";
import { throwHttpError } from "../utils/http-error.js";

export const getTodoByIdService = async (id) => {
  const existingTodo = todos.find((todo) => todo.id === id);

  if (!existingTodo) {
    throwHttpError(404, "Todo not found");
  }

  return existingTodo;
};

export const createNewTodoService = async (body) => {
  if (!body.title || !body.status) {
    throwHttpError(400, "Invalid data");
  }

  const { title, status } = body;

  const generateID = (todos[todos.length - 1]?.id ?? 0) + 1;
  const newTodo = {
    id: generateID,
    title,
    status,
  };

  todos.push(newTodo);

  return newTodo;
};

export const updateTodoService = async (id, body) => {
  if (!id) {
    throwHttpError(400, "Id not provided");
  }

  if (!body) {
    throwHttpError(400, "Missing Body");
  }

  if (Object.keys(body).length === 0) {
    throwHttpError(400, "Nothing data");
  }

  let todoIndex = todos.findIndex((todo) => todo.id === id);

  if (todoIndex === -1) {
    throwHttpError(404, "Todo not found");
  }

  const { title, status, ...rest } = todos[todoIndex];

  const newUpdatedTodo = {
    ...rest,
    title: body.title ?? title,
    status: body.status ?? status,
  };

  todos[todoIndex] = newUpdatedTodo;
};

export const deleteTodoService = async (id) => {
  const getIndex = todos.findIndex((todo) => todo.id === id);

  if (getIndex === -1) {
    throwHttpError(404, "Todo not found");
  }

  todos.splice(getIndex, 1);
};
