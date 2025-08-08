// src/middleware.ts
import { NextFunction, Request, Response } from "express";
import jwt, {
  JwtPayload,
  TokenExpiredError,
  JsonWebTokenError,
} from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const authentication = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Missing or malformed Authorization header" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    if (!decoded.userId) {
      return res.status(401).json({ error: "Invalid token payload" });
    }
    req.userId = decoded.userId;
    next();
  } catch (err: unknown) {
    if (err instanceof TokenExpiredError) {
      return res
        .status(401)
        .json({ error: "Token expired. Please sign in again." });
    }
    if (err instanceof JsonWebTokenError) {
      return res
        .status(401)
        .json({ error: "Invalid token. Please sign in again." });
    }
    console.error("Authentication error:", err);
    return res.status(500).json({ error: "Internal authentication error" });
  }
};
