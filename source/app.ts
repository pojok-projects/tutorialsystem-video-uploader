"use strict";
import path = require("path");
import express = require("express");
import bodyParser = require("body-parser");
import cors = require("cors");
import compression = require("compression");
import awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");
const app = express();
const router = express.Router();

app.set("view engine", "pug");

router.use(compression());
router.use(cors());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(awsServerlessExpressMiddleware.eventContext());

// NOTE: tests can't find the views directory without this
app.set("views", path.join(__dirname, "views"));

router.get("/", (req, res) => {
  res.render("index", {
    status: "ok"
  });
});

router.get(
  "/users",
  (_req: any, res: { json(arg0: { id: number; name: string }[]): void }) => {
    res.json(users);
  }
);

router.get(
  "/users/:userId",
  (
    req: { params: { userId: any } },
    res: {
      status(arg0: number): { json(arg0: {}): void };
      json(arg0: { id: number; name: string }): void;
    }
  ) => {
    const user = getUser(req.params.userId);

    if (!user) {
      return res.status(404).json({});
    }

    return res.json(user);
  }
);

router.post(
  "/users",
  (
    req: { body: { name: any } },
    res: {
      status(arg0: number): { json(arg0: { id: number; name: any }): void };
    }
  ) => {
    const user = {
      id: ++userIdCounter,
      name: req.body.name
    };
    users.push(user);
    res.status(201).json(user);
  }
);

router.put(
  "/users/:userId",
  (
    req: { params: { userId: any }; body: { name: string } },
    res: {
      status(arg0: number): { json(arg0: {}): void };
      json(arg0: { id: number; name: string }): void;
    }
  ) => {
    const user = getUser(req.params.userId);

    if (!user) {
      return res.status(404).json({});
    }

    user.name = req.body.name;
    res.json(user);
  }
);

router.delete(
  "/users/:userId",
  (
    req: { params: { userId: any } },
    res: {
      status(arg0: number): { json(arg0: {}): void };
      json(arg0: { id: number; name: string }[]): void;
    }
  ) => {
    const userIndex = getUserIndex(req.params.userId);

    if (userIndex === -1) {
      return res.status(404).json({});
    }

    users.splice(userIndex, 1);
    res.json(users);
  }
);

const getUser = (userId: string) => users.find(u => u.id === parseInt(userId));
const getUserIndex = (userId: string) =>
  users.findIndex(u => u.id === parseInt(userId));

// Ephemeral in-memory data store
const users = [
  {
    id: 1,
    name: "Joe"
  },
  {
    id: 2,
    name: "Jane"
  }
];
let userIdCounter = users.length;

// The aws-serverless-express library creates a server and listens on a Unix
// Domain Socket for you, so you can remove the usual call to app.listen.
// app.listen(3000)
app.use("/", router);

// Export your express server so you can import it in the lambda function.
module.exports = app;
