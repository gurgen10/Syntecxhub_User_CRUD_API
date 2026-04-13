import type { NextFunction, Request, Response } from "express";
import type { z } from "zod";
import { flattenError, type ZodError } from "zod";

export function validationErrorPayload(error: ZodError) {
  const flat = flattenError(error);
  return {
    message: "Validation failed",
    errors: flat.fieldErrors,
    ...(flat.formErrors.length > 0 ? { formErrors: flat.formErrors } : {}),
  };
}

export const validateBody =
  <S extends z.ZodType>(schema: S) =>
  (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(validationErrorPayload(parsed.error));
    }
    req.body = parsed.data;
    next();
  };

export const validateParams =
  <S extends z.ZodType>(schema: S) =>
  (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.params);
    if (!parsed.success) {
      return res.status(400).json(validationErrorPayload(parsed.error));
    }
    Object.assign(req.params, parsed.data);
    next();
  };
