import prisma from "../prisma/prisma";

export const createSchema = async (userId, name, jsonSchema) => {
  return await prisma.jSONSchema.create({
    data: {
      userId,
      name,
      schema: jsonSchema,
    },
  });
};

export const updateSchema = async (userId, name, jsonSchema) => {
  console.log(userId, name);
  return await prisma.jSONSchema.update({
    where: {
      userId_name: {
        userId,
        name,
      },
    },
    data: {
      schema: jsonSchema,
    },
  });
};

export const findSchemaByUsernameAndName = async (username, name) => {
  return await prisma.jSONSchema.findFirst({
    where: {
      user: {
        username,
      },
      name,
    },
  });
};

export const deleteSchemaByUsernameAndName = async (username, name) => {
  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  });

  return await prisma.jSONSchema.delete({
    where: {
      userId_name: {
        userId: user.id,
        name,
      },
    },
  });
};

export const getSchemasPaginated = async (username, limit, offset) => {
  return await prisma.jSONSchema.findMany({
    where: {
      user: {
        username,
      },
    },
    take: limit,
    skip: offset,
  });
};
