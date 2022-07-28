
const 
  passport = require('passport'),
  httpStatus = require('http-status'),
  authStrategies = require('./strategy'),
  protectedRoutes = [ // TODO: should rather get it later as a list from aegis-app
    '^(\/aegis\/api\/)(?!.*login)(?!.*config)' // all routes under api except login and config are protected
  ];

/**
 *  used to initialize passport js and the associated auth strategies into an express app
 * @param {ExpressApp} app 
 * @returns null
 */
const passportAuth = function(app){
  app.use(passport.initialize());
  (Object.keys(authStrategies)).forEach( key => passport.use(key, authStrategies[key]));
}

/**
 * 
 * @param {Object} req 
 * @param {Function} resolve 
 * @param {Function} reject 
 * @returns 
 */
const verifyAuth = (req, resolve, reject) => async (err, user, info) => {
  // all protected routes must have a passport strategy authentication
  if(protectedRoutes.findIndex(route => (new RegExp(route,'ig').test(req.path))) > -1){
    if (err || info || !user) {
      return reject({
        statusCode: httpStatus.UNAUTHORIZED, 
        error: new Error(httpStatus.UNAUTHORIZED,'Please authenticate')
      });
    }
  }
  req.user = user || {}; // user can be a null object on non-protected routes
  resolve();
};

const protectAuthRoutes = async (req, res, next) => {
  return new Promise((resolve, reject) => {
    passport.authenticate('jwt', { session: false }, verifyAuth(req, resolve, reject))(req, res, next);
  })
  .then( () => next() )
  .catch( ({statusCode, error}) => res.status(statusCode).send(error.message) );
};


module.exports = {
    passportAuth,
    protectAuthRoutes
};