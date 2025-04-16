import { prisma } from "../prisma";

export const registerUserService = async (username: string, email: string, password: string) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  });

  if (existingUser) {
    throw new Error("USERNAME_OR_EMAIL_TAKEN");
  }

  const newUser = await prisma.user.create({
    data: { username, email, password },
  });

  return newUser;
};

export const loginUserService = async (username: string, password: string) => {
  const user = await prisma.user.findFirst({
    where: { username, password },
    select: { id: true, username: true },
  });

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  return user;
};