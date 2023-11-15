import Strategy from 'passport-github2';

function initializeAuth(app, passport) {
  passport.use(new Strategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET
    },
    (accessToken, refreshToken, profile, cb) => {
      return cb(null, {
        id: profile.username,
        name: profile.displayName || profile.username,
        avatar: profile._json.avatar_url
      });
    }
  ));

  app
    .get('/login', passport.authenticate('github', { scope: ['user:email'] }))
    .get('/login/callback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => res.redirect('/'))
}

export { initializeAuth };