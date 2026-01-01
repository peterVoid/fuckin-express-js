import { todos } from "../data/todo.js";
import { throwHttpError } from "../utils/http-error.js";
import { pool } from "../db/index.js";

export const getTodosService = async ({ limit, offset }) => {
  const query = `
    SELECT * FROM TODOS
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
  `;
  const result = await pool.query(query, [limit, offset]);

  return result.rows;
};

export const getTodoByIdService = async (id) => {
  const query = `
    SELECT * FROM todos WHERE id = ($1)
  `;

  const existingTodo = await pool.query(query, [id]);

  if (!existingTodo) {
    throwHttpError(404, "Todo not found");
  }

  return existingTodo.rows;
};

export const createNewTodoService = async ({ title, status }) => {
  if (!title || !status) {
    throwHttpError(400, "Invalid data");
  }

  const query = `
    INSERT INTO todos (title, status)
    VALUES ($1, $2)
    RETURNING *
  `;

  const result = await pool.query(query, [title, status]);

  return result.rows[0];
};

export const updateTodoService = async (id, { title, status }) => {
  const query = `
    UPDATE todos
    SET title = $1, status = $2
    WHERE id = $3
    RETURNING *
  `;

  const result = await pool.query(query, [title, status, id]);

  if (result.rows.length === 0) {
    throwHttpError(404, "Todo not found");
  }

  return result.rows[0];
};

export const deleteTodoService = async (id) => {
  const query = `
  DELETE FROM todos
  WHERE id = $1
  `;

  const result = await pool.query(query, [id]);

  if (!result.rows.length === 0) {
    throwHttpError(404, "Todo not found");
  }

  return result.rows[0];
};
