import * as express from "express";
import * as dotenv from "dotenv";
import * as cors from "cors";
import * as bodyParser from "body-parser";
import * as AWS from "aws-sdk";

export const mainRouter = express.Router();

dotenv.config();
mainRouter.use(cors());
mainRouter.use(bodyParser.json());
mainRouter.use(bodyParser.urlencoded({ extended: true }));

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY
});
