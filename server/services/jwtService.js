import jwt from "jsonwebtoken";
import prisma from "../prisma/prisma";
import process from "process";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ACCESS_TOKEN_EXPIRATION = "1h";
const JWT_REFRESH_TOKEN_EXPIRATION = "7d";

export const generateRefreshToken = (userId) => {
  return jwt.sign({}, JWT_SECRET, {
    expiresIn: JWT_REFRESH_TOKEN_EXPIRATION,
    subject: userId,
  });
};

export const generateAccessToken = (userId) => {
  return jwt.sign({}, JWT_SECRET, {
    expiresIn: JWT_ACCESS_TOKEN_EXPIRATION,
    subject: userId,
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

export const isAccessTokenValid = async (accessToken) => {
  const decodedToken = decodeToken(accessToken);
  if (!decodedToken) {
    return false;
  }

  const refreshToken = await fetchRefreshToken(decodedToken.sub);
  if (!refreshToken) {
    return false;
  }

  const refreshInSeconds = Math.floor(refreshToken.lastRefreshed / 1000);
  if (refreshInSeconds > decodedToken.iat) {
    return false;
  }

  return true;
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

  const existingRefreshToken = await fetchRefreshToken(decodedToken.sub);
  if (
    !existingRefreshToken ||
    existingRefreshToken.refreshToken !== refreshToken
  ) {
    return null;
  }

  const accessToken = generateAccessToken(decodedToken.sub);

  await prisma.refreshToken.update({
    where: { userId: decodedToken.sub },
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
