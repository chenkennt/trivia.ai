import dotenv from 'dotenv';
import { io } from 'socket.io-client';
import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';

dotenv.config();

const count = Number.parseInt(process.argv[4] || 10);
const endpoint = process.argv[5] || 'http://localhost:3000';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function random(n) {
  let v = Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());
  return Math.max(Math.min(Math.round(v + n), 10), 1);
}

function random2(n) {
  return Math.floor(Math.random() * n) + 1;
}

async function connect(strength, speed) {
  let name = uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    separator: ' ',
    style: 'capital'
  });
  let id = name.replace(' ', '').toLocaleLowerCase() + Math.floor(Math.random() * 1000);

  let res = await fetch(`${endpoint}/login/bot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, name, secret: process.env.LOGIN_SECRET })
  });

  if (!res.ok) throw new Error('failed to login');
  let cookie = res.headers.get('set-cookie').split(';')[0];
  let res2 = await fetch(`${endpoint}/negotiate`, { headers: { 'cookie': cookie } });
  let socket;
  if (res2.ok) {
    let info = await res2.json();
    socket = io(info.endpoint, { path: info.path, query: { access_token: info.token } });
  } else socket = io(endpoint, { path: '/trivia', extraHeaders: { cookie } });

  socket.on('completeQuestion', async a => {
    let t = random(10 - speed) * 1000;
    await sleep(t);
    let answer = Math.random() < strength / 10 ? a.answer : a.choices.filter(c => c !== a.answer)[Math.floor(Math.random() * 3)];
    socket.emit('answer', { index: a.index, answer });
  });

  socket.on('connect', () => console.log(`connected as ${name} (${id}) with strength ${strength} and speed ${speed}`));
}

for (let i = 0; i < count; i++) connect(random2(Number.parseInt(process.argv[2]) || 6), random2(Number.parseInt(process.argv[3]) || 6));