import * as path from 'path';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as awsServerlessExpressMiddleware from 'aws-serverless-express/middleware';
const app = express();
const router = express.Router();

router.use(cors());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: true}));
router.use(awsServerlessExpressMiddleware.eventContext());

// NOTE: tests can't find the views directory without this
app.set('views', path.join(__dirname, 'views'));

router.get('/', (req, res) => {
  res.json({response: 'ok'});
});

router.get('/sam', (req, res) => {
  res.sendFile(`${__dirname}/sam-logo.png`);
});

router.get('/vidu/users', (req, res) => {
  res.json(users);
});

router.get('/users/:userId', (req, res) => {
  const user = getUser(req.params.userId);

  if (!user) {
    return res.status(404).json({});
  }

  return res.json(user);
});

router.post('/users', (req, res) => {
  const user = {
    id: ++userIdCounter,
    name: req.body.name,
  };
  users.push(user);
  res.status(201).json(user);
});

router.put('/users/:userId', (req, res) => {
  const user = getUser(req.params.userId);

  if (!user) {
    return res.status(404).json({});
  }

  user.name = req.body.name;
  return res.json(user);
});

router.delete('/users/:userId', (req, res) => {
  const userIndex = getUserIndex(req.params.userId);

  if (userIndex === -1) {
    return res.status(404).json({});
  }

  users.splice(userIndex, 1);
  return res.json(users);
});

const getUser = userId => users.find(u => u.id === parseInt(userId));
const getUserIndex = userId => users.findIndex(u => u.id === parseInt(userId));

// Ephemeral in-memory data store
const users = [
  {
    id: 1,
    name: 'Joe1',
  },
  {
    id: 2,
    name: 'Jane2',
  },
];
let userIdCounter = users.length;

app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

if (process.env.NODE_ENV) {
  app.listen(3000);
}

app.use('/', router);

module.exports = app;
