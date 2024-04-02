import prisma from "../prisma/prisma";
import bcrypt from "bcrypt";
import { generateRefreshToken, generateAccessToken } from "./jwtService";

export const registerUser = async (email, password, username) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
      },
    });

    const refreshToken = (
      await tx.refreshToken.create({
        data: {
          userId: user.id,
          refreshToken: generateRefreshToken(user.id),
          lastRefreshed: new Date(),
        },
      })
    ).refreshToken;

    const accessToken = generateAccessToken(user.id);

    return { user, accessToken, refreshToken };
  });
};

export const createUser = async (email, password, username) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  return await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      username,
    },
  });
};

export const findUserByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: { email },
  });
};

export const findUserById = async (id) => {
  return await prisma.user.findUnique({
    where: { id },
  });
};

export const findUserByUsername = async (username) => {
  return await prisma.user.findUnique({
    where: { username },
  });
};

export const deleteUserById = async (id) => {
  return await prisma.user.delete({
    where: { id },
  });
};
