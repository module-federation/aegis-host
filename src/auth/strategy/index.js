"use strict"

const 
  jwtStrategy= require('./jwtStrategy');
 
/**
 * exports collection of passport authentication strategies
 */
module.exports = { // add your strategies here
    'jwt': jwtStrategy
  };