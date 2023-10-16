import React, { Component } from 'react';
import cx from 'classnames';

class Leaderboard extends Component {
  state = {
    players: 0,
    leaderboard: [],
    score: 0
  };

  componentDidMount() {
    this.props.game.on('players', p => this.setState({ players: p }));
    this.props.game.on('leaderboard', l => this.setState({ leaderboard: l }));
    this.props.game.on('score', s => this.setState({ score: s }));
  }

  render() {
    let l = [...this.state.leaderboard];
    if (l.findIndex(p => p.id === this.props.user.id) === -1) l[3] = { id: this.props.user.id, name: this.props.user.name, score: this.state.score, noRanking: true };
    return (
      <div className="leaderboard mb-5">
        <div className="leaderboard-row">
          <span>
            <i className="bi bi-trophy" />
            Leaderboard
          </span>
          <span>{this.state.players} Players</span>
        </div>
        {l.map((p, i) =>
          <div key={i} className={cx('leaderboard-row', { 'ranking-me': p.id === this.props.user.id })}>
            <span>
              <i className={cx('bi', `bi-${i + 1}-circle-fill`, { invisible: p.noRanking })} />
              {p.name}
            </span>
            <span>{p.score}</span>
          </div>)
        }
      </div>
    );
  }
}

export { Leaderboard };