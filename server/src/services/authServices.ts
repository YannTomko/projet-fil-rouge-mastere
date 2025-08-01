import { prisma } from "../prisma";
import { hashPassword, verifyPassword } from "../utils/auth";

export const registerUserService = async (username: string, email: string, password: string) => {
  console.log("registerUserService called", { username, email }); 
  
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  });

  if (existingUser) {
    throw new Error("USERNAME_OR_EMAIL_TAKEN");
  }

  const hashedPass = await hashPassword(password);
  console.log(hashedPass)

  const newUser = await prisma.user.create({
    data: { username, email, password: hashedPass },
  });

  return newUser;
};

export const loginUserService = async (username: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true, username: true, password: true },
  });

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  return { id: user.id, username: user.username };
};