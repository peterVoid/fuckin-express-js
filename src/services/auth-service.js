import { pool } from "../db/index.js";
import { throwHttpError } from "../utils/http-error.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerService = async ({ email, password }) => {
  const query = `
  SELECT *
  FROM users
  WHERE email = $1
  `;

  const existingUser = await pool.query(query, [email]);

  if (existingUser.rowCount > 0) {
    throwHttpError(409, "Email already registered");
  }

  const passwordHash = await bcryptjs.hash(password, 10);

  const result = await pool.query(
    `
    INSERT INTO users (email, password_hash)
    VALUES ($1, $2)
    RETURNING *
    `,
    [email, passwordHash]
  );

  return result.rows[0];
};

export const loginService = async ({ email, password }) => {
  const query = `
    SELECT id, password_hash
    FROM users
    WHERE email = $1
  `;

  const result = await pool.query(query, [email]);

  if (result.rows.length === 0) {
    throwHttpError(401, "Invalid Credentials");
  }

  const user = result.rows[0];

  const isValidPassword = await bcryptjs.compare(password, user.password_hash);

  if (!isValidPassword) {
    throwHttpError(401, "Invalid Credentials");
  }

  const accessToken = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, {
    expiresIn: "10m",
  });
  const refreshToken = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await pool.query(
    `
      INSERT INTO refresh_token (user_id, token, expires_at)
      VALUES ($1, $2, $3)
    `,
    [user.id, refreshToken, expiresAt]
  );

  return {
    accessToken,
    refreshToken,
  };
};

export const refreshTokenService = async (refreshToken) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const findTokenQuery = `
      SELECT user_id
      FROM refresh_token
      WHERE token = $1
    `;

    const result = await client.query(findTokenQuery, [refreshToken]);

    if (result.rowCount === 0) {
      throwHttpError(401, "Invalid refresh token");
    }

    const userId = result.rows[0].user_id;

    await client.query(
      `
      DELETE FROM refresh_token 
      WHERE token = $1
      `,
      refreshToken
    );

    const newRefreshToken = crypto.randomUUID();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await client.query(
      `
      INSERT INTO refresh_token (user_id, token, expires_at)
      VALUES ($1, $2, $3)
    `,
      [userId, newRefreshToken, new Date(expiresAt)]
    );

    const accessToken = jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    await client.query("COMMIT");

    return {
      accessToken,
      newRefreshToken,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const logoutService = async (refreshToken) => {
  const query = `
  DELETE FROM refresh_token
  WHERE token = $1
  `;

  await pool.query(query, [refreshToken]);
};
