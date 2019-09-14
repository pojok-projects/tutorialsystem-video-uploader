import awsServerlessExpress = require("aws-serverless-express");
import { app } from "./app";
import * as awsServerlessExpressMiddleware from "aws-serverless-express/middleware";
app.use(awsServerlessExpressMiddleware.eventContext());

const server = awsServerlessExpress.createServer(app);

exports.handler = (event: any, context: any) =>
  awsServerlessExpress.proxy(server, event, context);
