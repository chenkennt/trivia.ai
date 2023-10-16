import http from 'http';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { createAzureOpenAIChat } from './openai.js';
import { Game } from './game.js';

dotenv.config();

let users = {};

function safeExec(handler) {
  return async (...params) => {
    try {
      await handler(...params);
    } catch (e) {
      console.log(e);
    }
  };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

dotenv.config();
const app = express();
const server = http.createServer(app);
app.use(express.static('public'));
app.use(express.json({ limit: '1mb' }));
app.use(express.text({ limit: '1mb' }));
let s = session({
  resave: false,
  saveUninitialized: true,
  secret: 'keyboard cat'
});
app.use(s);
let p = passport.initialize();
app.use(p);
let ps = passport.session();
app.use(ps);

passport.use(new GitHubStrategy(
  {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET
  },
  (accessToken, refreshToken, profile, cb) => {
    return cb(null, {
      id: profile.username,
      name: profile.displayName || profile.username,
      avatar: profile._json.avatar_url
    });
  }
));

passport.serializeUser((user, cb) => {
  users[user.id] = user;
  cb(null, user.id);
});

passport.deserializeUser((id, cb) => {
  if (users[id]) cb(null, users[id]);
  else cb(new Error('user not found'));
});

app
  .get('/user', (req, res) => {
    if (req.user) res.send(req.user);
    else res.status(401).end();
  })
  .get('/login', passport.authenticate('github', { scope: ['user:email'] }))
  .get('/login/callback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
    res.redirect('/');
  })
  .post('/login/secret', (req, res) => {
    if (req.body.secret !== process.env.LOGIN_SECRET) return res.status(401).end();
    req.login({ id: req.body.id, name: req.body.name }, e => {
      if (!e) res.status(204).end();
      else res.status(500).end();
    });
  });

const io = new Server(server, { path: '/trivia' });
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
io.use(wrap(s));
io.use(wrap(p));
io.use(wrap(ps));

let chat = createAzureOpenAIChat(process.env.AZURE_OPENAI_RESOURCE_NAME, process.env.AZURE_OPENAI_DEPLOYMENT_NAME, process.env.AZURE_OPENAI_API_KEY);
let game = new Game(chat);

let players = {};
let currentQuestion;
let currentScore = 0;

function updateLeaderboard(id, socket) {
  let l = Object.keys(players).map(i => ({
    id: i,
    name: players[i].name,
    score: players[i].score.reduce((a, b) => a + b, 0)
  })).sort((a, b) => {
    if (a.score === b.score) return a.name.localeCompare(b.name);
    else return b.score - a.score;
  }).slice(0, 4);
  if (id && l.findIndex(p => p.id === id) === -1) return;
  (socket || io).emit('leaderboard', l);
}

function updateStatus(socket) {
  (socket || io).emit('status', {
    status: game.status(),
    topic: game.topic()
  });
}

io.on('connection', socket => {
  if (!socket.request.user) {
    socket.disconnect();
    return;
  }

  let id = socket.request.user.id;
  let name = socket.request.user.name;
  console.log(`${name} connected`);

  if (!players[id]) players[id] = { name, score: [], answer: [], online: true };
  else {
    players[id].name = name;
    players[id].online = true;
  }
  socket.on('disconnect', () => {
    players[id].online = false
    console.log(`${name} disconnected`);
    io.emit('players', Object.values(players).filter(p => p.online).length);
  });

  io.emit('players', Object.values(players).filter(p => p.online).length);
  updateStatus(socket);
  updateLeaderboard(undefined, socket);
  socket.emit('score', players[id].score.reduce((a, b) => a + b, 0));
  if (currentQuestion) {
    let { answer, ...q } = currentQuestion;
    let a = players[id].answer[q.index];
    socket.emit('question', {
      ...q,
      answer: currentScore === 0 ? answer : undefined,
      userAnswer: a,
      correct: a && a === answer,
      score: a === answer ? currentScore : undefined
    });
    if (currentScore === 0) socket.emit('answer', { index: q.index, answer });
    else socket.emit('countdown', currentScore);
  }

  socket.on('answer', safeExec(async ({ index, answer }) => {
    if (!currentQuestion || currentScore === 0 || index === undefined) return;
    // do nothing if the client is answering a wrong question or the question is already answered
    if (index !== currentQuestion.index || players[id].score[index] !== undefined) return;
    players[id].answer[index] = answer;
    if (answer === currentQuestion.answer) {
      players[id].score[index] = currentScore;
      console.log(`player ${name} got ${currentScore}`);
      socket.emit('checkAnswer', { index, correct: true, score: currentScore });
      socket.emit('score', players[id].score.reduce((a, b) => a + b, 0));
      updateLeaderboard(id);
    } else {
      players[id].score[index] = 0;
      console.log(`player ${name} got 0`);
      socket.emit('checkAnswer', { index, correct: false });
      updateLeaderboard(id);
    }
  }));

  socket.on('start', safeExec(async topic => {
    for (let k in players) {
      if (!players[k].online) delete players[k];
      else {
        players[k].score = [];
        players[k].answer = [];
      }
    }

    let t = game.startAsync(topic);
    console.log('generating questions');
    updateStatus();
    try {
      await t;
    } catch (e) {
      updateStatus();
      console.log(e);
      return;
    }

    console.log('game started');
    updateStatus();
    updateLeaderboard();
    for (let i = 0; ; i++, await sleep(3000)) {
      let q = game.nextQuestion();
      if (!q) break;
      currentQuestion = { ...q, index: i };
      console.log(`sending question ${i + 1}`);
      io.emit('question', {
        index: i,
        question: q.question,
        choices: q.choices
      });
      for (currentScore = 10; currentScore > 0; await sleep(1000), currentScore--)
        io.emit('countdown', currentScore);
      io.emit('answer', { index: i, answer: q.answer });
    }

    currentQuestion = undefined;
    game.end();
    console.log('game ended');
    updateStatus();
    await sleep(20000);
    game.reset();
    console.log('game reset')
    updateStatus();
  }));
});

server.listen(3000, () => console.log('server started'));