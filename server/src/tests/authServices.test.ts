import { prisma } from "../prisma";
import { loginUserService, registerUserService } from "../services/authServices";


jest.mock("../prisma", () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
}));

const mockedUser = prisma.user as jest.Mocked<typeof prisma.user>;

describe("authServices", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("registerUserService", () => {
    it("doit rejeter si l'utilisateur existe", async () => {
      mockedUser.findFirst.mockResolvedValue({ id: 1, username: "u", email: "e", password: "p" });
      await expect(registerUserService("u", "e", "p"))
        .rejects.toThrow("USERNAME_OR_EMAIL_TAKEN");
    });

    it("doit créer et retourner un nouvel utilisateur", async () => {
      mockedUser.findFirst.mockResolvedValue(null);
      mockedUser.create.mockResolvedValue({ id: 2, username: "u", email: "e", password: "p" });
      const user = await registerUserService("u", "e", "p");
      expect(user.id).toBe(2);
    });
  });

  describe("loginUserService", () => {
    it("doit rejeter si identifiants invalides", async () => {
      mockedUser.findFirst.mockResolvedValue(null);
      await expect(loginUserService("u", "p"))
        .rejects.toThrow("INVALID_CREDENTIALS");
    });

    it("doit retourner l'utilisateur si succès", async () => {
      // Mock uniquement id et username, comme défini par le `select` dans le service
      mockedUser.findFirst.mockResolvedValue({ id: 3, username: "u" } as any);
      const user = await loginUserService("u", "p");
      expect(user).toEqual({ id: 3, username: "u" });
    });
  });
});
