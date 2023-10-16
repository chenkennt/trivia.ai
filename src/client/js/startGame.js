import React, { Component } from 'react';

class StartGame extends Component {
  state = {
    currentTopic: '',
    players: 1
  };

  componentDidMount() {
    this.props.game.on('players', p => this.setState({ players: p }));
  }

  render() {
    return (
      <>
        <span className="mb-2">Welcome to Trivia, {this.props.user.name}!</span>
        <span className="mb-4">Input a topic to start the game</span>
        <input className="mb-4" type="text" autoFocus value={this.state.currentTopic}
          onChange={e => this.setState({ currentTopic: e.target.value })}
          onKeyDown={e => { if (e.key === 'Enter') this.props.game.start(this.state.currentTopic); }}
        />
        <div className="mb-5">
          <button onClick={() => this.props.game.start(this.state.currentTopic)}>Start!</button>
        </div>
        <span className="small-text">{this.state.players} player{this.state.players > 1 && 's'} online</span>
      </>
    );
  }
}

export { StartGame };