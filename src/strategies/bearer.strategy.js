const Strategy = require('passport-http-bearer').Strategy;
const request = require('superagent');
const env = require('var');

/**
 * Bearer Strategy
 *
 * This strategy will handle requests with BearerTokens.  This is only a template and should be configured to
 * your AuthZ server specifications.
 *
 * Requires ENV variables for introspecting the token
 */
module.exports.strategy = new Strategy(async (token, done) => {
  console.log(21, env.INTROSPECTION_URL);
  console.log(22, token);

  if (!env.INTROSPECTION_URL) {
    return done(new Error('Invalid introspection endpoint.'));
  }

  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

  await request
    .get(env.INTROSPECTION_URL)
    // .set('content-type', 'application/x-www-form-urlencoded')
    // .send({ token: token, client_id: env.CLIENT_ID, client_secret: env.CLIENT_SECRET })
    .set('Authorization', `Bearer ${token}`)
    .then((introspectionResponse) => {
      // console.log(introspectionResponse);
      // console.log(introspectionResponse.body);
      const decoded_token = introspectionResponse.body;
      console.log(1, decoded_token);

      if (decoded_token) {
        // TODO: context could come in many forms, you need to decide how to handle it.
        // it could also be decodedToken.patient etc...
        let { scope, context, sub, user_id } = decoded_token;
        let user = { user_id, sub };

        // console.log(user);
        // return scopes and context.  Both required
        return done(null, user, { scope, context });
      }

      // default return unauthorized
      return done(new Error('Invalid token'));
    })
    .catch((err) => {
      // console.log('error', err);
      return done(new Error('Invalid token'));
    });
});
