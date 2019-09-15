import * as express from "express";
import { Server } from "http";
import { mainRouter } from "./routers";

export const app = express();

app.use("/", mainRouter);

if (process.env.NODE_ENV === "development") {
  const server: Server = app.listen(process.env.PORT, () =>
    console.log(
      "Node express listening at http://%s:%s",
      server.address().address,
      server.address().port
    )
  );
}
