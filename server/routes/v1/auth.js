import Router from "express-promise-router";
import bcrypt from "bcrypt";
import {
  generateTokens,
  deleteRefreshTokenByUserId,
  newAccessToken,
} from "../../services/jwtService";
import { findUserByEmail, registerUser } from "../../services/userService";
import { validateBodyMiddleware } from "../../middlewares/validationMiddleware";
import {
  loginSchema,
  refreshTokenSchema,
  registerSchema,
} from "../../validations/auth";

const authRouter = Router();

authRouter.post(
  "/login",
  validateBodyMiddleware(loginSchema),
  async (req, res) => {
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
  }
);

authRouter.post(
  "/register",
  validateBodyMiddleware(registerSchema),
  async (req, res) => {
    const { email, password, username } = req.body;
    const { accessToken, refreshToken } = await registerUser(
      email,
      password,
      username
    );

    res.json({ accessToken, refreshToken });
  }
);

authRouter.post(
  "/refresh-token",
  validateBodyMiddleware(refreshTokenSchema),
  async (req, res) => {
    const { refreshToken } = req.body;

    const accessToken = await newAccessToken(refreshToken);
    if (!accessToken) {
      return res.status(401).json({ error: "Invalid refresh token." });
    }

    res.json({ accessToken });
  }
);

authRouter.post("/logout", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  const { id } = req.user;
  await deleteRefreshTokenByUserId(id);

  res.status(200).json({ message: "Logged out successfully." });
});

export default authRouter;
