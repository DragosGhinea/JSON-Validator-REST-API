import request from "supertest";
import app from "../../server/app";
import { describe, it, expect, jest } from "@jest/globals";

import {
  generateTokens,
  newAccessToken,
} from "../../server/services/jwtService";
import {
  findUserByEmail,
  registerUser,
} from "../../server/services/userService";

jest.mock("../../server/services/jwtService");
jest.mock("../../server/services/userService");

const AUTH_PREFIX = "/v1/auth";

describe("Authentication routes", () => {
  describe("POST /login", () => {
    it("should login with valid credentials", async () => {
      findUserByEmail.mockResolvedValueOnce({
        id: "64ccc899-2dff-4aa7-9ef6-05c3279416a7",
        email: "test@example.com",
        username: "testuser",
        password:
          "$2b$10$.wVc9TifBKGLq2ND3R97K.p.Ifv0XMyH0BHF9RbZSlVhdsRGztmkW", //'test12' in bcrypt
      });
      generateTokens.mockResolvedValueOnce({
        accessToken: "mockAccessToken",
        refreshToken: "mockRefreshToken",
      });

      const response = await request(app)
        .post(`${AUTH_PREFIX}/login`)
        .send({ email: "test@example.com", password: "test12" });

      expect(response.status).toBe(200);
      expect(response.body.accessToken).toBe("mockAccessToken");
      expect(response.body.refreshToken).toBe("mockRefreshToken");
    });

    it("should return 404 if user not found", async () => {
      findUserByEmail.mockResolvedValueOnce(null);

      const response = await request(app)
        .post(`${AUTH_PREFIX}/login`)
        .send({ email: "nonexistent@example.com", password: "password" });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("User not found.");
    });

    it("should return 401 if invalid credentials", async () => {
      findUserByEmail.mockResolvedValueOnce({
        id: "64ccc899-2dff-4aa7-9ef6-05c3279416a7",
        email: "test@example.com",
        username: "testuser",
        password:
          "$2b$10$.wVc9TifBKGLq2ND3R97K.p.Ifv0XMyH0BHF9RbZSlVhdsRGztmkW", //'test12' in bcrypt
      });
      generateTokens.mockResolvedValueOnce({
        accessToken: "mockAccessToken",
        refreshToken: "mockRefreshToken",
      });

      const response = await request(app)
        .post(`${AUTH_PREFIX}/login`)
        .send({ email: "test@example.com", password: "wrongpassword" });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Invalid credentials.");
    });
  });

  describe("POST /register", () => {
    it("should register user", async () => {
      registerUser.mockResolvedValueOnce({
        accessToken: "mockAccessToken",
        refreshToken: "mockRefreshToken",
      });

      const response = await request(app).post(`${AUTH_PREFIX}/register`).send({
        email: "newuser@example.com",
        password: "password",
        username: "newuser",
      });

      expect(response.status).toBe(200);
      expect(response.body.accessToken).toBe("mockAccessToken");
      expect(response.body.refreshToken).toBe("mockRefreshToken");
    });
  });

  describe("POST /refresh-token", () => {
    it("should refresh access token", async () => {
      newAccessToken.mockImplementationOnce(async (refreshToken) =>
        refreshToken === "valid-refresh-token"
          ? "new-access-token"
          : "invalid-refresh-token"
      );
      const response = await request(app)
        .post(`${AUTH_PREFIX}/refresh-token`)
        .send({ refreshToken: "valid-refresh-token" });

      expect(response.status).toBe(200);
      expect(response.body.accessToken).toBe("new-access-token");
    });

    it("should return 401 if invalid refresh token", async () => {
      newAccessToken.mockResolvedValueOnce(null);

      const response = await request(app)
        .post(`${AUTH_PREFIX}/refresh-token`)
        .send({ refreshToken: "invalid-refresh-token" });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Invalid refresh token.");
    });
  });
});
