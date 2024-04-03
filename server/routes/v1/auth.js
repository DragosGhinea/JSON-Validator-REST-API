import Router from "express-promise-router";
import bcrypt from "bcrypt";
import {
  generateTokens,
  deleteRefreshTokenByUserId,
  decodeToken,
  newAccessToken,
} from "../../services/jwtService";
import {
  findUserByEmail,
  registerUser,
} from "../../services/userService";

const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await findUserByEmail(email);

  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  const { accessToken, refreshToken } = await generateTokens(user.id);

  res.json({
    accessToken,
    refreshToken,
  });
});

authRouter.post("/register", async (req, res) => {
  const { email, password, username } = req.body;
  const { accessToken, refreshToken } = await registerUser(
    email,
    password,
    username
  );

  res.json({ accessToken, refreshToken });
});

authRouter.post("/refresh-token", async (req, res) => {
  const { refreshToken } = req.body;

  const accessToken = await newAccessToken(refreshToken);
  if (!accessToken) {
    return res.status(401).json({ error: "Invalid refresh token." });
  }

  res.json({ accessToken });
});

authRouter.post("/logout", async (req, res) => {
  const { accessToken } = req.body;

  const { userId } = decodeToken(accessToken);
  await deleteRefreshTokenByUserId(userId);

  res.json({ message: "Logged out successfully." });
});

export default authRouter;
