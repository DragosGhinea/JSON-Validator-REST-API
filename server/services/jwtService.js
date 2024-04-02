import jwt from "jsonwebtoken";
import prisma from "../prisma/prisma";

const JWT_SECRET = "your_secret_key";
const JWT_ACCESS_TOKEN_EXPIRATION = "15m";
const JWT_REFRESH_TOKEN_EXPIRATION = "7d";

export const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: JWT_REFRESH_TOKEN_EXPIRATION,
  });
};

export const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: JWT_ACCESS_TOKEN_EXPIRATION,
  });
};

export const generateTokens = async (userId) => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);

  await saveRefreshToken(userId, refreshToken);

  return { accessToken, refreshToken };
};

export const decodeToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const fetchRefreshToken = async (userId) => {
  return await prisma.refreshToken.findUnique({ where: { userId } });
};

export const saveRefreshToken = async (userId, refreshToken) => {
  const existingRefreshToken = await fetchRefreshToken(userId);
  if (existingRefreshToken) {
    await prisma.refreshToken.update({
      where: { userId },
      data: { refreshToken, lastRefreshed: new Date() },
    });
  } else {
    await prisma.refreshToken.create({
      data: { userId, refreshToken, lastRefreshed: new Date() },
    });
  }
};

export const newAccessToken = async (refreshToken) => {
  const decodedToken = decodeToken(refreshToken);
  if (!decodedToken) {
    await deleteRefreshTokenByRefreshToken(refreshToken);
    return null;
  }

  const existingRefreshToken = await fetchRefreshToken(decodedToken.userId);
  if (
    !existingRefreshToken ||
    existingRefreshToken.refreshToken !== refreshToken
  ) {
    return null;
  }

  const accessToken = jwt.sign({ userId: decodedToken.userId }, JWT_SECRET, {
    expiresIn: JWT_ACCESS_TOKEN_EXPIRATION,
  });

  await prisma.refreshToken.update({
    where: { userId },
    data: { lastRefreshed: new Date() },
  });

  return accessToken;
};

export const deleteRefreshTokenByRefreshToken = async (refreshToken) => {
  await prisma.refreshToken.delete({ where: { refreshToken } });
};

export const deleteRefreshTokenByUserId = async (userId) => {
  await prisma.refreshToken.delete({ where: { userId } });
};
