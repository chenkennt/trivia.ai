import React, { Component } from 'react';
import { Leaderboard } from './leaderboard.js';

class EndGame extends Component {
  state = {
    winner: undefined,
    score: 0,
    place: 0
  };

  componentDidMount() {
    this.props.game.on('score', s => this.setState({ score: s }));
    this.props.game.on('leaderboard', l => {
      this.setState({ winner: l[0] });
      let p = l.findIndex(p => p.id === this.props.user.id);
      if (p > -1) this.setState({ place: p });
    });
  }

  renderResult() {
    if (this.state.place === 0) return <div className="mb-2 big-text">You won!</div>;
    else return <>
      <div className="mb-2 big-text">Winner is {this.state.winner.name}!</div>
      {this.state.place !== undefined && <div className="mb-2">You got {['2nd', '3rd', '4th'][this.state.place - 1]} place</div>}
    </>;
  }

  render() {
    return (
      <div className="game-page">
        <Leaderboard game={this.props.game} user={this.props.user} />
        <div className="mb-2">Game Over</div>
        {this.renderResult()}
      </div>
    );
  }
};

export { EndGame };