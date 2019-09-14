import { APIGatewayEvent, Context, ProxyCallback } from "aws-lambda";

export async function handler(
  event: APIGatewayEvent,
  context: Context,
  cb?: ProxyCallback
) {
  console.log("EVENT: ", event);
  _sendResponse(
    cb!,
    200,
    {
      code: 200,
      response: {
        logStreamName: context.logStreamName
      }
    },
    {}
  );
  return;
}

function _sendResponse(
  cb: ProxyCallback,
  statusCode: number,
  result: any,
  headers: { [k: string]: string }
) {
  headers["Cache-Control"] = "no-cache";

  if (result.errors && result.errors.length) {
    const body = JSON.stringify(result.errors, null, 2);
    cb(null, { statusCode, body, headers });
    return;
  } else {
    const body = JSON.stringify(result, null, 2);
    cb(null, { statusCode, body, headers });
  }
}
