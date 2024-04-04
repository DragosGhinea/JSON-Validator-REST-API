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

usersRouter.get("/me", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  const user = req.user;
  res.json(user);
});

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

usersRouter.delete(
  "/:id",
  validateParamsMiddleware(idParamSchema),
  async (req, res) => {
    const { id } = req.params;

    await deleteUserById(id);

    res.json({ message: "User deleted." });
  }
);

usersRouter.put(
  "/:id",
  validateParamsMiddleware(idParamSchema),
  validateBodyMiddleware(userUpdateSchema),
  async (req, res) => {
    const { id } = req.params;
    const { user: userDto } = req.body;

    const user = await updateUserById(id, userDto);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json(user);
  }
);

usersRouter.patch(
  "/change/username",
  validateBodyMiddleware(usernameChangeSchema),
  async (req, res) => {
    const { username } = req.body;

    const user = await updateUserById(req.user.id, { username });

    res.json(user);
  }
);

export default usersRouter;
