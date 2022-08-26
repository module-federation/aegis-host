
const
  { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt'),
  { tokenTypes } = require('../tokens'),
  cfg = require('../../../public/aegis.config.json'),
  config = (cfg && cfg.services && cfg.services.auth ? cfg.services.auth.passport : false) || process.env.AUTH, // ensure this is set at all times
  jwtOptions = { // must match the aegis-app generateToken options !
    secretOrKey: config.secret,
    algorithms: config.algorithm,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    issuer: config.issuer,
    audience: config.audience
  };

const jwtVerify = async (payload, done) => {
  try {
    if (payload.type !== tokenTypes.ACCESS) {
      throw new Error('Invalid token type');
    }

    if(!payload.sub) return done(null, false); // Early exit with unauthenticated return

    // CURRENTLY INSECURE AS WE DO NOT HAVE ACCESS TO USER DB MODEL / PORT OVER HERE

    const user = { ...payload };
    // if (!user) {
    //   return done(null, false);
    // }
    
    done(null, user);
  } catch (error) {
    done(error, false);
  }
};

module.exports = new JwtStrategy(jwtOptions, jwtVerify);