import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import passport from 'passport';
import User from '../models/User.js';

// Configure strategies on import so requiring this file is enough

  // Google Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
    }, async (accessToken, refreshToken, profile, done) => {
      const newUser = {
        providerId: profile.id,
        provider: 'google',
        name: profile.displayName,
      email: profile.emails && profile.emails[0] ? profile.emails[0].value : undefined,
      };
      try {
        let user = await User.findOne({ providerId: profile.id, provider: 'google' });
      if (!user && newUser.email) {
        user = await User.findOne({ email: newUser.email });
      }
        if (user) {
        return done(null, user);
        }
      const created = await User.create(newUser);
      return done(null, created);
      } catch (err) {
        console.error(err);
      return done(err, null);
      }
    }));
  } else {
    console.warn('Google OAuth credentials not found. Google login will be disabled.');
  }

  // Microsoft Strategy
  if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
    passport.use(new MicrosoftStrategy({
      clientID: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      callbackURL: '/api/auth/microsoft/callback',
      scope: ['user.read'],
    }, async (accessToken, refreshToken, profile, done) => {
    const primaryEmail = profile.emails && profile.emails[0] ? profile.emails[0].value : undefined;
      const newUser = {
        providerId: profile.id,
        provider: 'microsoft',
        name: profile.displayName,
      email: primaryEmail,
      };
      try {
        let user = await User.findOne({ providerId: profile.id, provider: 'microsoft' });
      if (!user && primaryEmail) {
        user = await User.findOne({ email: primaryEmail });
      }
        if (user) {
        return done(null, user);
        }
      const created = await User.create(newUser);
      return done(null, created);
      } catch (err) {
        console.error(err);
      return done(err, null);
      }
    }));
  } else {
    console.warn('Microsoft OAuth credentials not found. Microsoft login will be disabled.');
  }

  // Facebook Strategy
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(new FacebookStrategy({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: '/api/auth/facebook/callback',
      profileFields: ['id', 'displayName', 'emails'],
    }, async (accessToken, refreshToken, profile, done) => {
    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.id}@facebook.local`;
      const newUser = {
        providerId: profile.id,
        provider: 'facebook',
        name: profile.displayName,
      email,
      };
      try {
        let user = await User.findOne({ providerId: profile.id, provider: 'facebook' });
      if (!user && email) {
        user = await User.findOne({ email });
      }
        if (user) {
        return done(null, user);
          }
      const created = await User.create(newUser);
      return done(null, created);
      } catch (err) {
        console.error(err);
      return done(err, null);
      }
    }));
  } else {
    console.warn('Facebook OAuth credentials not found. Facebook login will be disabled.');
  }

  // Serialize user into the sessions
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the sessions
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;