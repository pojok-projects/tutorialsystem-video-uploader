import * as express from "express";

export function responseHelper(
  req: express.Request,
  res: express.Response,
  code: number,
  response: any
) {
  return res.status(code).json({
    code,
    response,
    path: req.originalUrl,
    method: req.method
  });
}
