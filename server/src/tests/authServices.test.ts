// authServices.test.ts
import { prisma } from "../prisma";
import { registerUserService, loginUserService } from "../services/authServices";
import { hashPassword, verifyPassword } from "../utils/auth";

// mocks pour les services (sont hoistés par Jest)
jest.mock("../prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
}));
jest.mock("../utils/auth", () => ({
  hashPassword: jest.fn(),
  verifyPassword: jest.fn(),
}));

// récupération des mocks typés
const mockedPrisma = prisma as unknown as {
  user: {
    findUnique: jest.Mock;
    findFirst: jest.Mock;
    create: jest.Mock;
  };
};
const mockedHashPassword = hashPassword as jest.MockedFunction<typeof hashPassword>;
const mockedVerifyPassword = verifyPassword as jest.MockedFunction<typeof verifyPassword>;

describe("utils/auth (implémentation réelle)", () => {
  beforeAll(() => {
    process.env.BCRYPT_SALT_ROUNDS = "1"; // accélère le hash pour test
  });

  // on force l’usage de l’implémentation réelle malgré le mock global
  const { hashPassword: realHashPassword, verifyPassword: realVerifyPassword } =
    jest.requireActual("../utils/auth");

  it("hash et vérifie correctement un mot de passe", async () => {
    const plain = "monSecret";
    const hash = await realHashPassword(plain);
    expect(hash).not.toBe(plain);
    expect(await realVerifyPassword(plain, hash)).toBe(true);
    expect(await realVerifyPassword("mauvais", hash)).toBe(false);
  });
});

describe("authServices (avec mocks)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("registerUserService", () => {
    it("doit rejeter si l'utilisateur existe", async () => {
      mockedPrisma.user.findFirst.mockResolvedValue({
        id: 1,
        username: "u",
        email: "e",
        password: "p",
      });
      await expect(registerUserService("u", "e", "p")).rejects.toThrow(
        "USERNAME_OR_EMAIL_TAKEN"
      );
    });

    it("doit créer et retourner un nouvel utilisateur", async () => {
      mockedPrisma.user.findFirst.mockResolvedValue(null);
      mockedHashPassword.mockResolvedValue("hashedpw");
      mockedPrisma.user.create.mockResolvedValue({
        id: 2,
        username: "u",
        email: "e",
        password: "hashedpw",
      });
      const user = await registerUserService("u", "e", "p");
      expect(user.id).toBe(2);
      expect(user.username).toBe("u");
      expect(user.email).toBe("e");
    });
  });

  describe("loginUserService", () => {
    it("rejette si utilisateur introuvable", async () => {
      mockedPrisma.user.findUnique.mockResolvedValue(null);
      await expect(loginUserService("u", "p")).rejects.toThrow(
        "INVALID_CREDENTIALS"
      );
    });

    it("rejette si mot de passe invalide", async () => {
      mockedPrisma.user.findUnique.mockResolvedValue({
        id: 3,
        username: "u",
        password: "hashed",
      });
      mockedVerifyPassword.mockResolvedValue(false);
      await expect(loginUserService("u", "p")).rejects.toThrow(
        "INVALID_CREDENTIALS"
      );
    });

    it("retourne l'utilisateur si succès", async () => {
      mockedPrisma.user.findUnique.mockResolvedValue({
        id: 3,
        username: "u",
        password: "hashed",
      });
      mockedVerifyPassword.mockResolvedValue(true);
      const user = await loginUserService("u", "p");
      expect(user).toEqual({ id: 3, username: "u" });
    });
  });
});
