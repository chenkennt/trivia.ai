import dotenv from 'dotenv';
import { io } from 'socket.io-client';
import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';

dotenv.config();

const count = Number.parseInt(process.argv[2] || '10');
const endpoint = process.argv[3] || 'http://localhost:3000';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function connect() {
  let name = uniqueNamesGenerator({
    dictionaries: [ adjectives, animals ],
    separator: ' ',
    style: 'capital'
  });

  let res = await fetch(`${endpoint}/login/secret`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: name.replace(' ', '').toLocaleLowerCase(),
      name,
      secret: process.env.LOGIN_SECRET
    })
  });

  if (res.status !== 204) throw new Error('failed to login');
  let cookie = res.headers.get('set-cookie').split(';')[0];
  console.log(`connected as ${name}`);

  let socket = io(endpoint, { path: '/trivia', extraHeaders: { cookie } });
  socket.on('question', async q => {
    await sleep(Math.pow(Math.random(), 2) * 10000);
    socket.emit('answer', { index: q.index, answer: q.choices[Math.floor(Math.random() * 4)]});
  });
}

for (let i = 0; i < count; i++) connect();