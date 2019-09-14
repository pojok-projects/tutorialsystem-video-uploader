import * as express from "express";
import { Server } from "http";
import { responseHelper } from "./controllers/ResponseHelper";
import { viduRouter } from "./routers/vidu";
import { mainRouter } from "./routers/main";

export const app = express();

app.use("/", mainRouter);
app.use("/vidu", viduRouter);
app.all("/*", (req, res) => responseHelper(req, res, 422, "Invalid Request"));

if (process.env.NODE_ENV === "development") {
  const server: Server = app.listen(process.env.PORT, () =>
    console.log(
      "Node express listening at http://%s:%s",
      server.address().address,
      server.address().port
    )
  );
}
