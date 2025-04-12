import { prisma } from "../prisma";

export const registerUserService = async (username: string, email: string, password: string) => {
  const existingUser = await prisma.users.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  });

  if (existingUser) {
    throw new Error("USERNAME_OR_EMAIL_TAKEN");
  }

  const newUser = await prisma.users.create({
    data: { username, email, password },
  });

  return newUser;
};

export const loginUserService = async (username: string, password: string) => {
  const user = await prisma.users.findFirst({
    where: { username, password },
    select: { id: true, username: true },
  });

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  return user;
};

export const getAllUsersService = async () => {
  return await prisma.users.findMany({
    select: { id: true, username: true, email: true },
  });
};