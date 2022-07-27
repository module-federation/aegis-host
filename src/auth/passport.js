
const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const config = require('../../public/aegis.config.json').services.auth.passport || process.env.AUTH; // ensure this is set at all times
const { tokenTypes } = require('./tokens');
const httpStatus = require('http-status');

const jwtOptions = {
    secretOrKey: config.secret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    issuer: config.issuer,
    audience: config.audience
};

const jwtVerify = async (payload, done) => {
    try {
      if (payload.type !== tokenTypes.ACCESS) {
        throw new Error('Invalid token type');
      }

      if(!payload.sub) return done(null, false); // Early exit with unauthenticated return - HIGHLY INSECURE

      // CURRENTLY INSECURE AS WE DO NOT HAVE ACCESS TO USER DB MODEL / PORT OVER HERE

      // const user = await User.findById(payload.sub);
      // if (!user) {
      //   return done(null, false);
      // }
      
      done(null, user);
    } catch (error) {
      done(error, false);
    }
};

const aegisStrategy = new JwtStrategy(jwtOptions, jwtVerify);

const passportAuth = function(app){
  // aegisStrategy authentication
  app.use(passport.initialize());
  passport.use('jwt', aegisStrategy);
}


const verifyAuth = (req, resolve, reject, requiredRights) => async (err, user, info) => {
  if (err || info || !user) {
    return reject(new Error(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }
  req.user = user;
  resolve();
};

const protectAuthRoutes = (...requiredRights) => async (req, res, next) => {
  return new Promise((resolve, reject) => {
    passport.authenticate('jwt', { session: false }, verifyAuth(req, resolve, reject, requiredRights))(req, res, next);
  })
  .then(() => next())
  .catch((err) => next(err));
};


module.exports = {
    passportAuth,
    protectAuthRoutes
};