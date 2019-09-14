import { responseHelper } from "../controllers/ResponseHelper";
import * as express from "express";
import { v1Router } from "./v1";

export const viduRouter = express.Router();

viduRouter.get("/health-check", (req, res) =>
  responseHelper(req, res, 200, "ok")
);

viduRouter.use("/v1", v1Router);
