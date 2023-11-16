import Strategy from 'passport-azure-ad-oauth2';

let avatars = {};

function initializeAuth(app, passport) {
  passport.use(new Strategy(
    {
      clientID: process.env.ENTRA_ID_CLIENT_ID,
      clientSecret: process.env.ENTRA_ID_CLIENT_SECRET,
      resource: '00000003-0000-0000-c000-000000000000',
      tenant: process.env.ENTRA_ID_TENANT
    },
    async function (accessToken, refresh_token, params, profile, done) {
      let responseMe = await fetch('https://graph.microsoft.com/v1.0/me', { headers: { Authorization: `Bearer ${accessToken}` } });
      let me = await responseMe.json();
      let user = {
        id: me.userPrincipalName,
        name: me.displayName
      };
      let responseAvatar = await fetch('https://graph.microsoft.com/v1.0/me/photo/$value', { headers: { Authorization: `Bearer ${accessToken}` } });
      if (responseAvatar.ok) {
        avatars[user.userPrincipalName] = await responseAvatar.blob();
        user.avatar = `/avatars/${user.userPrincipalName}`;
      }
      done(null, user);
    }
  ));

  app
    .get('/login', passport.authenticate('azure_ad_oauth2'))
    .get('/login/callback', passport.authenticate('azure_ad_oauth2', { failureRedirect: '/login' }), (req, res) => res.redirect('/'))
    .get('/avatars/:id', async (req, res) => {
      let avatar = avatars[req.params.id];
      if (avatar) res.type(avatar.type).send(Buffer.from(await avatar.arrayBuffer()));
      else res.status(404).end();
    });
}

export { initializeAuth };