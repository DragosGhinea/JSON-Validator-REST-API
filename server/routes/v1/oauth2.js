import { Strategy as DiscordStrategy } from "passport-discord";
import Router from "express-promise-router";
import passport from "passport";
import process from "process";
import { findUserByEmail } from "../../services/userService";
import { generateTokens } from "../../services/jwtService";

const oauth2Router = Router();

var scopes = ["identify", "email"];

passport.use(
  new DiscordStrategy(
    {
      clientID: process.env.OAUTH_DISCORD_CLIENT_ID,
      clientSecret: process.env.OAUTH_DISCORD_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/v1/oauth2/login/callback/discord",
      scope: scopes,
    },

    async function (_accessToken, _refreshToken, profile, done) {
      try {
        const user = await findUserByEmail(profile.email);
        if (!user) {
          throw Error("You need to be registered to use this service.");
        }

        const tokens = await generateTokens(user.id);
        return done(null, tokens);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

oauth2Router.get(
  "/login/discord",
  passport.authenticate("discord", { scope: ["identify", "email"] })
);

oauth2Router.get(
  "/login/callback/discord",
  passport.authenticate("discord", { session: false }),
  function (req, res) {
    res.json(req.user);
  }
);

export default oauth2Router;
