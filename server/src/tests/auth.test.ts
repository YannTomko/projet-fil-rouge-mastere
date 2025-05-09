import request from "supertest";
import app from "../app";
import * as authServices from "../services/authServices";
import * as jwtUtils from "../utils/jwt";

jest.mock("../services/authServices");
jest.mock("../utils/jwt");

describe("Auth routes", () => {
  describe("POST /api/auth/register", () => {
    it("should return 400 if missing fields", async () => {
      const res = await request(app).post("/api/auth/register").send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Username, email et password sont requis");
    });

    it("should return 201 on successful register", async () => {
      jest.spyOn(authServices, "registerUserService").mockResolvedValue({
        id: 1,
        username: "testuser",
        email: "test@example.com",
        password: "password123"
      });

      const res = await request(app).post("/api/auth/register").send({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Utilisateur enregistré");
    });

    it("should return 400 if username/email taken", async () => {
      jest.spyOn(authServices, "registerUserService").mockRejectedValue(new Error("USERNAME_OR_EMAIL_TAKEN"));

      const res = await request(app).post("/api/auth/register").send({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Nom d'utilisateur ou email déjà utilisé");
    });
  });

  describe("POST /api/auth/login", () => {
    it("should return 400 if missing fields", async () => {
      const res = await request(app).post("/api/auth/login").send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Username et password sont requis");
    });

    it("should return 200 with tokens and user", async () => {
      jest.spyOn(authServices, "loginUserService").mockResolvedValue({ id: 1, username: "testuser" });
      jest.spyOn(jwtUtils, "generateAccessToken").mockReturnValue("access.token");
      jest.spyOn(jwtUtils, "generateRefreshToken").mockReturnValue("refresh.token");

      const res = await request(app).post("/api/auth/login").send({
        username: "testuser",
        password: "password123",
      });

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBe("access.token");
      expect(res.body.refreshToken).toBe("refresh.token");
    });

    it("should return 400 on invalid credentials", async () => {
      jest.spyOn(authServices, "loginUserService").mockRejectedValue(new Error("INVALID_CREDENTIALS"));

      const res = await request(app).post("/api/auth/login").send({
        username: "wronguser",
        password: "wrongpass",
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Identifiants invalides");
    });
  });

  describe("POST /api/auth/refresh", () => {
    it("should return 400 if no refreshToken", async () => {
      const res = await request(app).post("/api/auth/refresh").send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Refresh token manquant");
    });

    it("should return 200 with new access token", async () => {
      jest.spyOn(jwtUtils, "verifyToken").mockReturnValue({ id: 1 });
      jest.spyOn(jwtUtils, "generateAccessToken").mockReturnValue("new.access.token");

      const res = await request(app).post("/api/auth/refresh").send({
        refreshToken: '"valid.refresh.token"',
      });

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBe("new.access.token");
    });

    it("should return 401 with invalid token", async () => {
      jest.spyOn(jwtUtils, "verifyToken").mockImplementation(() => {
        throw new Error("invalid");
      });

      const res = await request(app).post("/api/auth/refresh").send({
        refreshToken: '"invalid.token"',
      });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Refresh token invalide");
    });
  });
});
