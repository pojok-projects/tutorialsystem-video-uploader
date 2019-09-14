"use strict";
const awsServerlessExpress = require("aws-serverless-express");
const appProxy = require("./app");
const server = awsServerlessExpress.createServer(appProxy);

exports.handler = (event, context) => {
  awsServerlessExpress.proxy(server, event, context);
};
