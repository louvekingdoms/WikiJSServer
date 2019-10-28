'use strict'

/* global appconfig, appdata, db, lang, winston */

const fs = require('fs')
const _ = require('lodash')

module.exports = function (passport) {
  // Serialization user methods

  passport.serializeUser(function (user, done) {
    done(null, user.id)
  })

  passport.deserializeUser(function (id, done) {
    db.findUserById(id).then((user) => {
      if (user) {
        done(null, user)
      } else {
        done(new Error(lang.t('auth:errors:usernotfound')), null)
      }
      return true
    }).catch((err) => {
      done(err, null)
    })
  })

  // Local Account

  if (appconfig.auth.local && appconfig.auth.local.enabled) {
    const LocalStrategy = require('passport-local').Strategy
    passport.use('local',
      new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
      }, (uEmail, uPassword, done) => {
        db.findUserByParameters({ mail: uEmail }).then((user) => {
          if (user) {
            return db.util.user.validatePassword(uPassword, user.password).then(() => {
              return done(null, user) || true
            }).catch((err) => {
              return done(err, null)
            })
          } else {
            return done(new Error('INVALID_LOGIN'), null)
          }
        }).catch((err) => {
          done(err, null)
        })
      }
      ))
  }
  
  // GitHub

  if (appconfig.auth.github && appconfig.auth.github.enabled) {
    const GitHubStrategy = require('passport-github2').Strategy
    passport.use('github',
      new GitHubStrategy({
        clientID: appconfig.auth.github.clientId,
        clientSecret: appconfig.auth.github.clientSecret,
        callbackURL: appconfig.host + '/login/github/callback',
        scope: ['user:email']
      }, (accessToken, refreshToken, profile, cb) => {
        db.util.user.processProfile(profile).then((user) => {
          return cb(null, user) || true
        }).catch((err) => {
          return cb(err, null) || true
        })
      }
      ))
  }
  
  // OAuth 2

  if (appconfig.auth.oauth2 && appconfig.auth.oauth2.enabled) {
    const OAuth2Strategy = require('passport-oauth2').Strategy
    passport.use('oauth2',
      new OAuth2Strategy({
        authorizationURL: appconfig.auth.oauth2.authorizationURL,
        tokenURL: appconfig.auth.oauth2.tokenURL,
        clientID: appconfig.auth.oauth2.clientId,
        clientSecret: appconfig.auth.oauth2.clientSecret,
        callbackURL: appconfig.host + '/login/oauth2/callback'
      }, (accessToken, refreshToken, profile, cb) => {
        db.util.user.processProfile(profile).then((user) => {
          return cb(null, user) || true
        }).catch((err) => {
          return cb(err, null) || true
        })
      }
      ))
  }
}
