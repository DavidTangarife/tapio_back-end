import { NextFunction, Request, Response } from "express";
import { getErrorMessage } from "../utils";

export default function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log('Hi! I\'m a handler')
  if (res.headersSent) {
    next(error);
    return;
  }

  res.status(404).json({
    error: {
      message: getErrorMessage(error)
    }
  })
}
