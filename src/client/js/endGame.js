import React, { Component } from 'react';
import { Leaderboard } from './leaderboard.js';

class EndGame extends Component {
  state = {
    winner: undefined,
    place: 0
  };

  componentDidMount() {
    this.props.game.on('leaderboard', l => {
      this.setState({ winner: l[0] });
      let p = l.findIndex(p => p.id === this.props.user.id);
      this.setState({ place: p > -1 ? p : undefined });
    });
  }

  renderResult() {
    return <>
      <div className="mb-2">Winner is</div>
      <img className="winner" src={this.state.winner?.avatar}/>
      <div className="mb-2 big-text">{this.state.winner?.name}</div>
      {this.state.place === 0 && <div className="mb-2">You won!</div>}
      {this.state.place > 0 && <div className="mb-2">You got {['2nd', '3rd', '4th'][this.state.place - 1]} place</div>}
    </>;
  }

  render() {
    return (
      <div className="game-page">
        <Leaderboard game={this.props.game} user={this.props.user} static={true} />
        <div className="mb-2">Game Over</div>
        {this.renderResult()}
      </div>
    );
  }
};

export { EndGame };