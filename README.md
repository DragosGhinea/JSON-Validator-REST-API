# JSON-Validator-REST-API

ExpressJS project for NodeJS course. This REST application is a json schema hosting which allows users to upload multiple json schemas, which can afterwards be validated by anyone through an assigned link.

## ES6 + Jest

ES6 and Jest added by following: https://www.freecodecamp.org/news/how-to-enable-es6-and-beyond-syntax-with-node-and-express-68d3e11fe1ab/

Unlike the tutorial above, [cross-env](https://github.com/kentcdodds/cross-env) is used for a platform agnostic solution.

## Jest

There are 6 unit tests creating for the authentication endpoints, testing the format in which the input is received and output is shown.

## Environmental variables

```
JWT_SECRET=secret_key

OAUTH_DISCORD_CLIENT_ID=client_id
OAUTH_DISCORD_CLIENT_SECRET=client_secret
```

The `JWT_SECRET` variable is necessary for signing access and refresh tokens generated by the application.
The `OAUTH_DISCORD_CLIENT_ID` and `OAUTH_DISCORD_CLIENT_SECRET` variables are necessary for using Discord to obtain access and refresh tokens.

## Running the application

- `npm run test` - Run jest tests
- `npm run watch:dev` - Run nodemon instance over a development run
- `npm run dev` - Run dev mode normally
- `npm run build` - Build the application in the dist-server folder

# Database

## Prisma

The following command is used to update the database:

`npx prisma db push --schema server/prisma/schema.prisma`

Prisma with SQLite is used for this project.

## Diagram

A minimalistic relational database for our use case:

![DatabaseDiagram](https://github.com/DragosGhinea/JSON-Validator-REST-API/blob/main/docs/DatabaseDiagram.svg)

As seen in the diagram above, a user can have multiple json schemas but only one refresh token at a time. The `lastRefreshed` field also ensures that there is only one access token per refresh token, since at each refresh the old access token is invalidated.

# Usage

In the flow charts below I am refferring to a user (not necessarly logged in) that only wants to validate JSONs against schemas as a `consumer` and to a user that has an account and can manage multiple schemas as a `producer`.

A `producer` and a `consumer` are not mutually exclusive. A user may be both.

![Validate](https://github.com/DragosGhinea/JSON-Validator-REST-API/blob/main/docs/RestAPI_Validate.svg)
![CreateSchema](https://github.com/DragosGhinea/JSON-Validator-REST-API/blob/main/docs/RestAPI_CreateSchema.svg)
