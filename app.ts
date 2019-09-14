import * as express from "express";
import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as awsServerlessExpressMiddleware from "aws-serverless-express/middleware";
import * as dotenv from "dotenv";
import * as AWS from "aws-sdk";
import { Server } from "http";
import { UploadHelper } from "./lib/UploadHelper";
import { responseHelper } from "./lib/ResponseHelper";

const app = express();
const router = express.Router();
const multiparty = require("connect-multiparty");
const multipartyMiddleware = multiparty();

dotenv.config();
router.use(cors());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(awsServerlessExpressMiddleware.eventContext());

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY
});

router.get("/health-check", (req, res) => responseHelper(req, res, 200, "ok"));

router.all("/*", (req, res) =>
  responseHelper(req, res, 522, "Invalid Request")
);

app.post("/upload", multipartyMiddleware, (req: any, res) => {
  const uploadHelper = new UploadHelper(req, res);
  return uploadHelper.getFileSize() < 5000000
    ? uploadHelper.smallUpload()
    : uploadHelper.multipartUpload();
});

app.use("/", router);

if (process.env.NODE_ENV === "development") {
  const server: Server = app.listen(process.env.PORT, () =>
    console.log(
      "Node express listening at http://%s:%s",
      server.address().address,
      server.address().port
    )
  );
}

module.exports = app;
