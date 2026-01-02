import { pool } from "../db/index.js";
import { throwHttpError } from "../utils/http-error.js";

export const getTodosService = async ({ limit, offset, completed, search }) => {
  const values = [];
  const where = [];

  if (completed !== undefined) {
    values.push(completed);
    where.push(`completed = $${values.length}`);
  }

  if (search) {
    values.push(`%${search}%`);
    where.push(`title ilike $${values.length}`);
  }

  const whereClause = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

  const dataValues = [...values, limit, offset];

  const query = `
    SELECT * FROM todos
    ${whereClause}
    ORDER BY id DESC
    LIMIT $${dataValues.length - 1} OFFSET $${dataValues.length}
  `;

  const countQuery = `
    SELECT COUNT(*) FROM todos
    ${whereClause}
  `;

  const [dataResult, countResult] = await Promise.all([
    pool.query(query, dataValues),
    pool.query(countQuery, dataValues.slice(0, dataValues.length - 2)),
  ]);

  const total = Number(countResult.rows[0].count);

  return {
    data: dataResult.rows,
    total,
  };
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

export const createNewTodoService = async (userId, { title, status }) => {
  if (!title || !status) {
    throwHttpError(400, "Invalid data");
  }

  const query = `
    INSERT INTO todos (title, status, user_id)
    VALUES ($1, $2, $3)
    RETURNING *
  `;

  const result = await pool.query(query, [title, status, userId]);

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
