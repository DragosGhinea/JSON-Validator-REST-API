/**
 * @swagger
 * components:
 *   securitySchemes:
 *     discordOAuth2:
 *       type: oauth2
 *       flows:
 *         authorizationCode:
 *           authorizationUrl: 'https://discord.com/api/oauth2/authorize'
 *           tokenUrl: 'https://discord.com/api/oauth2/token'
 *           scopes:
 *             identify: Grants access to user's Discord ID.
 *             email: Grants access to user's email address.
 */

import { Strategy as DiscordStrategy } from "passport-discord";
import Router from "express-promise-router";
import passport from "passport";
import process from "process";
import { findUserByEmail } from "../../services/userService";
import { generateTokens } from "../../services/jwtService";

const oauth2Router = Router();

/**
 * Passport Discord OAuth2 strategy
 */
passport.use(
  new DiscordStrategy(
    {
      clientID: process.env.OAUTH_DISCORD_CLIENT_ID,
      clientSecret: process.env.OAUTH_DISCORD_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/v1/oauth2/login/callback/discord",
      scope: ["identify", "email"],
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

/**
 * @swagger
 * /v1/oauth2/login/discord:
 *   get:
 *     summary: Initiate Discord OAuth2 login flow.
 *     tags:
 *       - OAuth2
 *     security:
 *       - discordOAuth2: ['identify', 'email']
 *     responses:
 *       '302':
 *         description: Redirects to Discord authorization URL.
 */
oauth2Router.get(
  "/login/discord",
  passport.authenticate("discord", { scope: ["identify", "email"] })
);

/**
 * @swagger
 * /v1/oauth2/login/callback/discord:
 *   get:
 *     summary: Callback endpoint for Discord OAuth2 authentication.
 *     tags:
 *       - OAuth2
 *     security:
 *       - discordOAuth2: ['identify', 'email']
 *     responses:
 *       '200':
 *         description: User successfully authenticated via Discord OAuth2.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: Access token for the authenticated user.
 *                 refreshToken:
 *                   type: string
 *                   description: Refresh token for the authenticated user.
 */
oauth2Router.get(
  "/login/callback/discord",
  passport.authenticate("discord", { session: false }),
  function (req, res) {
    res.json(req.user);
  }
);

export default oauth2Router;
