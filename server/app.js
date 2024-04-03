import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import errorHandlerMiddleware from "./middlewares/errorHandlingMiddleware";
import injectUserMiddleware from "./middlewares/injectUserMiddleware";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import "dotenv/config";

import authRouter from "./routes/v1/auth";
import usersRouter from "./routes/v1/users";
import jsonSchemasRouter from "./routes/v1/jsonSchemas";
import oauth2Router from "./routes/v1/oauth2";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "JsonValidator REST API",
      version: "0.0.1",
    },
  },
  apis: ["./server/routes*.js"],
};
const swaggerSpec = swaggerJSDoc(swaggerOptions);

var app = express();

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(logger("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// eslint-disable-next-line no-undef
app.use(express.static(path.join(__dirname, "../public")));

app.use(injectUserMiddleware);

app.use("/v1/auth/", authRouter);
app.use("/v1/users/", usersRouter);
app.use("/v1/schemas/", jsonSchemasRouter);
app.use("/v1/oauth2/", oauth2Router);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(errorHandlerMiddleware);

// module.exports = app;
export default app;
