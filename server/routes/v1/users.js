/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The unique identifier of the user.
 *         username:
 *           type: string
 *           description: The username of the user.
 *       required:
 *         - id
 *         - username
 *
 *     UserUpdate:
 *       type: object
 *       properties:
 *         user:
 *           $ref: '#/components/schemas/User'
 *       required:
 *         - user
 *
 *     UsernameChange:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *           description: The new username for the user.
 *       required:
 *         - username
 */

import Router from "express-promise-router";
import {
  findUserById,
  updateUserById,
  deleteUserById,
} from "../../services/userService";
import {
  validateBodyMiddleware,
  validateParamsMiddleware,
} from "../../middlewares/validationMiddleware";
import {
  idParamSchema,
  usernameChangeSchema,
  userUpdateSchema,
} from "../../validations/users";

const usersRouter = Router();

/**
 * @swagger
 * /v1/users/me:
 *   get:
 *     summary: Get the currently authenticated user.
 *     tags:
 *       - Users
 *     responses:
 *       '200':
 *         description: User details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
usersRouter.get("/me", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  const user = req.user;
  res.json(user);
});

/**
 * @swagger
 * /v1/users/{id}:
 *   get:
 *     summary: Get user by ID.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       '200':
 *         description: User found successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '404':
 *         description: User not found.
 */
usersRouter.get(
  "/:id",
  validateParamsMiddleware(idParamSchema),
  async (req, res) => {
    const { id } = req.params;

    const user = await findUserById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json({ ...user, password: undefined });
  }
);

/**
 * @swagger
 * /v1/users/{id}:
 *   delete:
 *     summary: Delete user by ID.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       '200':
 *         description: User deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Deletion success message.
 */
usersRouter.delete(
  "/:id",
  validateParamsMiddleware(idParamSchema),
  async (req, res) => {
    const { id } = req.params;

    await deleteUserById(id);

    res.json({ message: "User deleted." });
  }
);

/**
 * @swagger
 * /v1/users/{id}:
 *   put:
 *     summary: Update user by ID.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdate'
 *     responses:
 *       '200':
 *         description: User updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '404':
 *         description: User not found.
 */
usersRouter.put(
  "/:id",
  validateParamsMiddleware(idParamSchema),
  validateBodyMiddleware(userUpdateSchema),
  async (req, res) => {
    const { id } = req.params;
    const { user: userDto } = req.body;

    const user = await updateUserById(id, { ...userDto, password: undefined });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json({ ...user, password: undefined });
  }
);

/**
 * @swagger
 * /v1/users/change/username:
 *   patch:
 *     summary: Change username.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UsernameChange'
 *     responses:
 *       '200':
 *         description: Username changed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
usersRouter.patch(
  "/change/username",
  validateBodyMiddleware(usernameChangeSchema),
  async (req, res) => {
    const { username } = req.body;

    const user = await updateUserById(req.user.id, { username });
    
    res.json({...user, password: undefined});
  }
);

export default usersRouter;
