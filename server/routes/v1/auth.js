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
/**
 * @swagger
 * components:
 *   schemas:
 *     LoginInput:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         password:
 *           type: string
 *           description: User's password
 *       required:
 *         - email
 *         - password
 *
 *     RegisterInput:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         password:
 *           type: string
 *           description: User's password
 *         username:
 *           type: string
 *           description: User's username
 *       required:
 *         - email
 *         - password
 *         - username
 *
 *     RefreshTokenInput:
 *       type: object
 *       properties:
 *         refreshToken:
 *           type: string
 *           description: Refresh token
 *       required:
 *         - refreshToken
 *
 *     LoginResponse:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *           description: Access token for the user
 *         refreshToken:
 *           type: string
 *           description: Refresh token for the user
 *       required:
 *         - accessToken
 *         - refreshToken
 */

/**
 * @swagger
 * /v1/auth/login:
 *   post:
 *     summary: Logs in a user.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       '200':
 *         description: Successful login. Returns access and refresh tokens.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 */
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

/**
 * @swagger
 * /v1/auth/register:
 *   post:
 *     summary: Registers a new user.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       '200':
 *         description: Successful registration. Returns access and refresh tokens.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 */
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

/**
 * @swagger
 * /v1/auth/refresh-token:
 *   post:
 *     summary: Refreshes an access token using a refresh token.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenInput'
 *     responses:
 *       '200':
 *         description: Successful token refresh. Returns a new access token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: New access token.
 */
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

/**
 * @swagger
 * /v1/auth/logout:
 *   post:
 *     summary: Logs out a user.
 *     tags:
 *       - Authentication
 *     responses:
 *       '200':
 *         description: Successful logout.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Logout success message.
 */
authRouter.post("/logout", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  const { id } = req.user;
  await deleteRefreshTokenByUserId(id);

  res.status(200).json({ message: "Logged out successfully." });
});

export default authRouter;
