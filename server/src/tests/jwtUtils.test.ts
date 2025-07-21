/* eslint-disable @typescript-eslint/no-var-requires */
describe("jwt utils", () => {
  const MODULE_PATH = "../utils/jwt";

  beforeEach(() => {
    jest.resetModules();
  });

  it("lance si JWT_SECRET absent", () => {
    delete process.env.JWT_SECRET;
    expect(() =>
      jest.isolateModules(() => require(MODULE_PATH))
    ).toThrow("JWT_SECRET is missing from environment variables.");
  });

  it("génère et vérifie un access token", () => {
    process.env.JWT_SECRET = "testsecret";
    jest.isolateModules(() => {
      const { generateAccessToken, verifyToken } = require(MODULE_PATH) as typeof import("../utils/jwt");
      const token = generateAccessToken({ id: 123 });
      const payload = verifyToken(token) as any;
      expect(payload.id).toBe(123);
    });
  });

  it("génère et vérifie un refresh token", () => {
    process.env.JWT_SECRET = "testsecret";
    jest.isolateModules(() => {
      const { generateRefreshToken, verifyToken } = require(MODULE_PATH) as typeof import("../utils/jwt");
      const token = generateRefreshToken({ id: 456 });
      const payload = verifyToken(token) as any;
      expect(payload.id).toBe(456);
    });
  });

  it("échoue sur token invalide", () => {
    process.env.JWT_SECRET = "testsecret";
    jest.isolateModules(() => {
      const { verifyToken } = require(MODULE_PATH) as typeof import("../utils/jwt");
      expect(() => verifyToken("not.a.token")).toThrow();
    });
  });
});
