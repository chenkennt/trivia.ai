import { generateQuestions } from './openai.js';
// import { generateQuestions } from './sampleQuestions.js';

class Game {
  constructor(chat) {
    this._status = 'not_started';
    this._chat = chat;
  }

  async startAsync(topic) {
    if (!topic) throw new Error('no topic specified', { cause: 'bad_argument' });
    if (this._status !== 'not_started') throw new Error('game already started', { cause: 'game_already_started' });
    this._status = 'preparing';
    this._topic = topic;
    try {
      this._questions = await generateQuestions(this._chat, topic, 12);
      this._next = 0;
      this._status = 'started';
    } catch (e) {
      this._status = 'not_started';
      throw e;
    }
  }

  status() {
    return this._status;
  }

  topic() {
    return this._topic;
  }

  nextQuestion() {
    if (this._status !== 'started') throw new Error('game not started', { cause: 'game_not_started' });
    if (this._next >= this._questions.length) return;
    return this._questions[this._next++];
  }

  end() {
    this._status = 'ended';
  }

  reset() {
    this._status = 'not_started';
  }
}

export { Game };