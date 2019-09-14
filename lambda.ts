import awsServerlessExpress = require('aws-serverless-express');
const server = awsServerlessExpress.createServer(require('./app'));

exports.handler = (event: any, context: any) =>
  awsServerlessExpress.proxy(server, event, context);
