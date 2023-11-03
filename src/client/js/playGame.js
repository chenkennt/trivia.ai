import React, { Component } from 'react';
import cx from 'classnames';
import { Leaderboard } from './leaderboard.js';

class PlayGame extends Component {
  state = {
    index: 0,
    question: '',
    choices: [],
    countdown: 0,
    answer: undefined,
    userAnswer: undefined,
    correct: undefined,
    score: undefined,
  };

  componentDidMount() {
    this.props.game.on('question', q => this.setState({ index: q.index, question: q.question, choices: q.choices, answer: q.answer, userAnswer: q.userAnswer, correct: q.correct, score: q.score }));
    this.props.game.on('countdown', t => this.setState({ countdown: t }));
    this.props.game.on('answer', a => { if (this.state.index === a.index) this.setState({ answer: a.answer }); });
    this.props.game.on('checkAnswer', a => { if (this.state.index === a.index) this.setState({ correct: a.correct, score: a.score }); });
  }

  render() {
    return (
      <div className="game-page">
        <Leaderboard game={this.props.game} user={this.props.user} />
        <div className="mb-2">Question {this.state.index + 1}:</div>
        <div className="mb-2">{this.state.question}</div>
        <div className="mb-2 big-text">{this.state.answer || this.state.countdown}</div>
        {this.state.choices.map((c, i) =>
          <div className="mb-2" key={i}>
            <button disabled={this.state.userAnswer || this.state.answer} className={cx('choice', { correct: this.state.userAnswer === c && this.state.correct, incorrect: this.state.userAnswer === c && this.state.correct === false })} onClick={() => {
              this.setState({ userAnswer: c });
              this.props.game.answer(this.state.index, c);
            }}>
              {this.state.userAnswer === c && this.state.correct && <i className="bi bi-check-circle-fill" />}
              {this.state.userAnswer === c && this.state.correct === false && <i className="bi bi-x-circle-fill" />}
              {c}
              {this.state.userAnswer === c && this.state.score !== undefined && <span className="score">+{this.state.score}</span>}
            </button>
          </div>
        )}
      </div>
    );
  }
}

export { PlayGame };