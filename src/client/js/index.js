import React, { Component } from 'react';
import ReactDOM from 'react-dom/client';
import { io } from 'socket.io-client';
import { StartGame } from './startGame.js';
import { PlayGame } from './playGame.js';
import { EndGame } from './endGame.js';
import '../css/style.css';

class Game {
  constructor() {
    this._socket = io({ path: '/trivia' });
    this._states = {};
    this._callbacks = {};
    this.registerEvent('players', 'status', 'score', 'question', 'leaderboard', 'answer', 'countdown', 'checkAnswer');
  }

  registerEvent(...events) {
    events.forEach(e => this._socket.on(e, d => {
      this._states[e] = d;
      if (this._callbacks[e]) this._callbacks[e].forEach(cb => cb(d));
    }));
  }

  on(event, callback) {
    if (this._states[event]) callback(this._states[event]);
    this._callbacks[event] = this._callbacks[event] || [];
    this._callbacks[event].push(callback);
  }

  start(topic) {
    this._socket.emit('start', topic);
  }

  answer(index, answer) {
    this._socket.emit('answer', { index, answer });
  }
}

class App extends Component {
  state = {
    user: undefined,
    status: 'not_started',
    topic: ''
  };

  async componentDidMount() {
    let res = await fetch('/user');
    if (res.status === 200) {
      this._game = new Game();
      this._game.on('status', status => this.setState({ status: status.status, topic: status.topic }));
      let user = await res.json();
      this.setState({ user });
    }
  }

  render() {
    if (!this.state.user) return <>
      <span className="mb-4">Welcome to Trivia!</span>
      <button onClick={() => window.location = '/login'}>Login</button>
    </>;

    switch (this.state.status) {
      case 'not_started':
        return <StartGame game={this._game} user={this.state.user} />;
      case 'preparing':
        return <>
          <span className="mb-2">Please wait while system is generating questions for</span>
          <span className="big-text">{this.state.topic}</span>
        </>;
      case 'started':
        return <PlayGame game={this._game} user={this.state.user} />;
      case 'ended':
        return <EndGame game={this._game} user={this.state.user} />;
    }
  }
}

let element = document.querySelector('#app');
let root = ReactDOM.createRoot(element);
root.render(<App />);