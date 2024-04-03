import Router from "express-promise-router";
import { findUserById, updateUserById } from "../../services/userService";

const usersRouter = Router();

usersRouter.get("/me", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  const user = req.user;
  res.json(user);
});

usersRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  const user = findUserById(id);

  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  res.json(user);
});

usersRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;

  await deleteUserById(id);

  res.json({ message: "User deleted." });
});

usersRouter.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { userDto } = req.body;

  const user = await updateUserById(id, userDto);

  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  res.json(user);
});

usersRouter.patch("/change/username", async (req, res) => {
  const { username } = req.body;

  const user = await updateUserById(req.user.id, { username });

  res.json(user);
});

export default usersRouter;
