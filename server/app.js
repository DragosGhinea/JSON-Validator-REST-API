import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import authRouter from "./routes/v1/auth";
import errorHandler from "./middlewares/errorHandlingMiddleware";
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import 'dotenv/config'

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'JsonValidator REST API',
      version: '0.0.1',
    },
  },
  apis: ['./server/routes*.js'],
};
const swaggerSpec = swaggerJSDoc(swaggerOptions);

var app = express();

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(logger("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));

app.use("/v1/auth/", authRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

app.use(errorHandler);

module.exports = app;
