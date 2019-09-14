import * as express from "express";
import * as AWS from "aws-sdk";
import * as fs from "fs";
import {
  UploadPartRequest,
  CompleteMultipartUploadRequest
} from "aws-sdk/clients/s3";
import S3 = require("aws-sdk/clients/s3");
import { responseHelper } from "./ResponseHelper";

const s3 = new AWS.S3();

export class UploadHelper {
  private readonly req: express.Request;
  private readonly res: express.Response;
  private readonly file: any;

  constructor(req: any, res: express.Response) {
    this.req = req;
    this.res = res;
    this.file = req.files.file;
  }

  public getFileSize(): number {
    return this.file.size;
  }

  public smallUpload() {
    s3.upload(
      {
        Bucket: "media.tutorialinaja.tech",
        Key: this.file.name,
        Body: fs.createReadStream(this.file.path)
      },
      (err: any, data: any) => {
        return err
          ? responseHelper(this.req, this.res, 500, err.message)
          : responseHelper(this.req, this.res, 200, data);
      }
    );
  }

  public multipartUpload() {
    const buffer = fs.readFileSync(this.file.path);

    const startTime = new Date() as any;
    const partSize = 1024 * 1024 * 5; // 5mb chunks except last part
    const maxUploadTries = 3;

    let numPartsLeft = Math.ceil(buffer.length / partSize);
    let partNum = 0;

    const multipartParams = {
      Bucket: "media.tutorialinaja.tech",
      Key: this.file.name,
      ContentType: this.file.type
    };

    const multipartMap: any = {
      Parts: []
    };

    console.log("Creating multipart upload for:", this.file.name);
    s3.createMultipartUpload(
      multipartParams,
      (mpErr, multipart: S3.Types.CreateMultipartUploadOutput) => {
        if (mpErr) {
          return console.error("Error!", mpErr);
        }
        console.log("Got upload ID", multipart.UploadId);

        for (let start = 0; start < buffer.length; start += partSize) {
          partNum++;
          const partParams: UploadPartRequest = {
            Body: buffer.slice(
              start,
              Math.min(start + partSize, buffer.length)
            ),
            Bucket: multipartParams.Bucket,
            Key: multipartParams.Key,
            PartNumber: partNum,
            UploadId: multipart.UploadId as string
          };

          console.log(
            "Uploading part: #",
            partParams.PartNumber,
            ", Start:",
            start
          );
          uploadPart(s3, multipart, partParams, partNum, this.req, this.res);
        }
      }
    );

    function completeMultipartUpload(
      s3: AWS.S3,
      doneParams: CompleteMultipartUploadRequest,
      req: express.Request,
      res: express.Response
    ) {
      s3.completeMultipartUpload(doneParams, (err: any, data: any) => {
        if (err) {
          responseHelper(req, res, 422, err.message);
          return console.error(
            "An error occurred while completing multipart upload",
            err
          );
        }
        let delta = ((new Date() as any) - startTime) / 1000;
        console.log(`Completed upload in  ${delta} seconds`);
        console.log("Final upload data:", data);
        responseHelper(req, res, 200, data);
      });
    }

    function uploadPart(
      s3: AWS.S3,
      multipart: AWS.S3.CreateMultipartUploadOutput,
      partParams: UploadPartRequest,
      partNum: number,
      req: express.Request,
      res: express.Response
    ) {
      let tryNum = partNum || 1;
      s3.uploadPart(partParams, (multiErr: any, mData: { ETag: any }) => {
        if (multiErr) {
          console.log("Upload part error:", multiErr);

          if (tryNum < maxUploadTries) {
            console.log("Retrying upload of part: #", partParams.PartNumber);
            uploadPart(s3, multipart, partParams, tryNum + 1, req, res);
          } else {
            console.log("Failed uploading part: #", partParams.PartNumber);
          }
        }

        multipartMap.Parts[tryNum - 1] = {
          ETag: mData.ETag,
          PartNumber: Number(tryNum)
        };

        console.log("mData", mData);
        if (--numPartsLeft > 0) {
          return;
        }

        const doneParams: CompleteMultipartUploadRequest = {
          Bucket: multipartParams.Bucket,
          Key: multipartParams.Key,
          MultipartUpload: multipartMap,
          UploadId: multipart.UploadId as string
        };

        console.log("Completing upload...");
        completeMultipartUpload(s3, doneParams, req, res);
      }).on("httpUploadProgress", (progress: any) =>
        console.log("progress: ", progress)
      );
    }
  }
}
