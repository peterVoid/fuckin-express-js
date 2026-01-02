import { getUserByIdService } from "../services/user-service.js";
import { asyncHandler } from "../utils/async-handler.js";

export const getUserById = asyncHandler(async (req, res) => {
  const user = await getUserByIdService(Number(req.params.id));

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({ user });
});
