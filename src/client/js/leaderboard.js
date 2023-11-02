import React, { Component } from 'react';
import cx from 'classnames';

class Leaderboard extends Component {
  state = {
    players: 0,
    leaderboard: new Array(8).fill(0).map(() => ({ pos: 4 }))
  };

  componentDidMount() {
    this.props.game.on('checkAnswer', a => this.state.leaderboard.filter(p => p.id === this.props.user.id).forEach(p => this.updateScore(p, a.correct ? a.score : 0)));
    this.props.game.on('players', p => this.setState({ players: p }));
    this.props.game.on('leaderboard', l => this.updateLeaderboard(l));
    this.props.game.on('score', s => this.updateTotalScore(s));
  }

  updateLeaderboard(leaderboard) {
    let score = this.state.leaderboard.find(p => p.id === this.props.user.id)?.totalScore || 0;
    if (leaderboard.findIndex(p => p.id === this.props.user.id) === -1) leaderboard[3] = { ...this.props.user, totalScore: score, noRank: true };
    this.state.leaderboard.forEach(p => p.updated = false);
    leaderboard.forEach((p, i) => {
      let j = this.state.leaderboard.findIndex(l => l.id === p.id);
      if (j < 0) {
        j = this.state.leaderboard.findIndex(l => l.pos === 4);
        this.state.leaderboard[j] = { ...p, pos: i, updated: true };
      } else Object.assign(this.state.leaderboard[j], { ...p, pos: i, updated: true, noRank: p.noRank });
      if (p.score !== undefined) this.updateScore(this.state.leaderboard[j], p.score);
    });
    this.state.leaderboard.forEach(p => { if (!p.updated) p.pos = 4; });
    this.setState({});
  }

  updateScore(player, score) {
    player.score = score;
    setTimeout(() => { player.score = undefined; this.setState({}); }, 2000);
  }

  updateTotalScore(score) {
    this.state.leaderboard.filter(p => p.id === this.props.user.id).forEach(p => p.totalScore = score);
    this.setState({});
  }

  render() {
    return (
      <div className="leaderboard mb-5">
        <div className="leaderboard-row">
          <span>
            <i className="bi bi-trophy" />
            Leaderboard
          </span>
          <span>{this.state.players} Players</span>
        </div>
        {this.state.leaderboard.map((p, i) =>
          <div key={i} className={cx('leaderboard-row', `rank-${p.pos + 1}`, { 'ranking-me': p.id === this.props.user.id })}>
            <span className="leaderboard-player">
              <i className={cx('bi', `bi-${p.pos + 1}-circle-fill`, { invisible: p.noRank })} />
              {p.avatar ?
                <img src={p.avatar} />
                :
                <i className="bi bi-person-circle" />
              }
              {p.name}
              {!this.props.static &&
                <span className={cx('score', { visible: p.score !== undefined })}>
                  {p.score > 0 && <><span className="emoji">😁</span>+{p.score}</>}
                  {p.score === 0 && <span className="emoji">😟</span>}
                </span>
              }
            </span>
            <span>{p.totalScore}</span>
          </div>)
        }
      </div>
    );
  }
}

export { Leaderboard };