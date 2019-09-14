import * as express from "express";
import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as awsServerlessExpressMiddleware from "aws-serverless-express/middleware";
import { responseHelper } from "../lib/ResponseHelper";
import { UploadHelper } from "../lib/UploadHelper";
import { Express } from "express";

export function router(app: Express) {
  const multiparty = require("connect-multiparty");
  const multipartyMiddleware = multiparty();
  const router = express.Router();

  router.use(cors());
  router.use(bodyParser.json());
  router.use(bodyParser.urlencoded({ extended: true }));
  router.use(awsServerlessExpressMiddleware.eventContext());

  router.get("/health-check", (req: express.Request, res: express.Response) =>
    responseHelper(req, res, 200, "ok")
  );

  router.all("/*", (req: express.Request, res: express.Response) =>
    responseHelper(req, res, 522, "Invalid Request")
  );

  router.post(
    "/upload",
    multipartyMiddleware,
    (req: express.Request, res: express.Response) => {
      const uploadHelper = new UploadHelper(req, res);
      return uploadHelper.getFileSize() < 5000000
        ? uploadHelper.smallUpload()
        : uploadHelper.multipartUpload();
    }
  );

  app.use("/", router);
}
