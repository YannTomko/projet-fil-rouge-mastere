jest.mock("../utils/jwt", () => ({
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn(),
  verifyToken: jest.fn(),
}));

import { authMiddleware } from "../middlewares/jwt";
import { Request, Response, NextFunction } from "express";
import * as jwtUtils from "../utils/jwt";

describe("authMiddleware", () => {
  let req: any;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { headers: {} }; 
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it("401 si pas de header", () => {
    authMiddleware(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Access token manquant" });
  });

  it("401 si header mal formé", () => {
    req.headers.authorization = "Token abc";
    authMiddleware(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Access token manquant" });
  });

  it("forward si token valide", () => {
    req.headers.authorization = 'Bearer "tok"';
    (jwtUtils.verifyToken as jest.Mock).mockReturnValue({ id: 5 });
    authMiddleware(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
    expect((req as any).user).toEqual({ id: 5 });
  });

  it("401 si token invalide non expiré", () => {
    req.headers.authorization = "Bearer bad";
    const err = new Error("bad"); err.name = "JsonWebTokenError";
    (jwtUtils.verifyToken as jest.Mock).mockImplementation(() => { throw err });
    authMiddleware(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Token invalide" });
  });

  it("401 refresh missing si expired sans x-refresh-token", () => {
    req.headers.authorization = "Bearer bad";
    const err = new Error("exp"); err.name = "TokenExpiredError";
    (jwtUtils.verifyToken as jest.Mock).mockImplementation(() => { throw err });
    authMiddleware(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Refresh token manquant" });
  });

  it("401 si refresh invalide", () => {
    req.headers.authorization = "Bearer old";
    req.headers["x-refresh-token"] = '"badref"';
    const exp = new Error("exp"); exp.name = "TokenExpiredError";
    (jwtUtils.verifyToken as jest.Mock)
      .mockImplementationOnce(() => { throw exp })
      .mockImplementationOnce(() => { throw new Error() }); 
    authMiddleware(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Refresh token invalide" });
  });

  it("rotate token si refresh valide", () => {
    req.headers.authorization = "Bearer oldtok";
    req.headers["x-refresh-token"] = '"goodref"';
    (jwtUtils.verifyToken as jest.Mock)
      .mockImplementationOnce(() => { throw Object.assign(new Error(), { name: "TokenExpiredError" }) })
      .mockReturnValueOnce({ id: 7 })
      .mockReturnValueOnce({ id: 7 }); 
    (jwtUtils.generateAccessToken as jest.Mock).mockReturnValue("newtok");
    authMiddleware(req as Request, res as Response, next);
    expect(res.setHeader).toHaveBeenCalledWith("x-access-token", "newtok");
    expect((req as any).user).toEqual({ id: 7 });
    expect(next).toHaveBeenCalled();
  });
});
