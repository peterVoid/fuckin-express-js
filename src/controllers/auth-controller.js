import {
  loginService,
  refreshTokenService,
  registerService,
} from "../services/auth-service.js";
import { asyncHandler } from "../utils/async-handler.js";
import { throwHttpError } from "../utils/http-error.js";

export const register = asyncHandler(async (req, res) => {
  const user = await registerService(req.body);

  res.status(201).json({ data: user });
});

export const login = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken } = await loginService(req.body);

  res
    .cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    })
    .status(200)
    .json({ accessToken });
});

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refresh_token;

  if (!refreshToken) {
    throwHttpError(401, "Refresh token missing");
  }

  const { accessToken, newRefreshToken } = await refreshTokenService(
    refreshToken
  );

  res.cookie("refresh_token", newRefreshToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: false,
  });

  res.json({ accessToken });
});

export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refresh_token;

  if (!refreshToken) {
    return res.sendStatus(204);
  }

  res.clearCookie("refresh_token", {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
  });

  res.status(201).json({ message: "Logged out successfully" });
});
