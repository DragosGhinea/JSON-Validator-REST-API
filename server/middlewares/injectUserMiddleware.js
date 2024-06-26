import { decodeToken, isAccessTokenValid } from "../services/jwtService";
import { findUserById } from "../services/userService";
import process from "process";

async function injectUserMiddleware(req, res, next) {
  if (process.env.NODE_ENV === "test") return next();

  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return next();
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token missing" });
  }

  if (!(await isAccessTokenValid(token))) {
    return res.status(401).json({ message: "Invalid access token" });
  }

  const { sub } = decodeToken(token);
  const user = await findUserById(sub);
  req.user = { ...user, password: undefined };

  next();
}

export default injectUserMiddleware;
