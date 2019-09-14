import { UploadHelper } from "../controllers/UploadHelper";
import * as express from "express";

export const v1Router = express.Router();

v1Router.post(
  "/upload",
  require("connect-multiparty")(),
  (req: express.Request, res: express.Response) => {
    const uploadHelper = new UploadHelper(req, res);
    return uploadHelper.getFileSize() < 5000000
      ? uploadHelper.smallUpload()
      : uploadHelper.multipartUpload();
  }
);
