import Router from "express-promise-router";
import {
  findSchemaByUsernameAndName,
  createSchema,
  updateSchema,
  deleteSchemaByUsernameAndName,
  getSchemasPaginated,
} from "../../services/schemaStorageService";
import { findUserByUsername } from "../../services/userService";
import { validateSchema } from "../../services/schemaValidationService";
import { sameUserAuthorization } from "../../middlewares/authorizationMiddleware";
import {
  validateBodyMiddleware,
  validateParamsMiddleware,
  validateQueryMiddleware,
} from "../../middlewares/validationMiddleware";
import {
  createUpdateSchemaBody,
  createUpdateSchemaParams,
  getSchemasParams,
  getSchemasQuery,
  validateSchemaBody,
  validateSchemaParams,
} from "../../validations/jsonSchemas";

const jsonSchemasRouter = Router();

jsonSchemasRouter.post(
  "/:username/:name/validate",
  validateParamsMiddleware(validateSchemaParams),
  validateBodyMiddleware(validateSchemaBody),
  async (req, res) => {
    const { username, name } = req.params;
    const { jsonToValidate } = req.body;

    const schema = await findSchemaByUsernameAndName(username, name);

    if (!schema) {
      return res.status(404).json({ error: "Schema not found." });
    }

    const parsedSchema = JSON.parse(schema.schema);

    res.json(validateSchema(parsedSchema, jsonToValidate));
  }
);

jsonSchemasRouter.get(
  "/:username/:name",
  validateParamsMiddleware(createUpdateSchemaParams),
  sameUserAuthorization(
    (user) => user.username,
    (req) => req.username
  ),
  async (req, res) => {
    const { username, name } = req.params;
    const schema = await findSchemaByUsernameAndName(username, name);
    res.status(200).json(schema);
  }
);

jsonSchemasRouter.post(
  "/:username/:name",
  validateParamsMiddleware(createUpdateSchemaParams),
  validateBodyMiddleware(createUpdateSchemaBody),
  sameUserAuthorization(
    (user) => user.username,
    (req) => req.username
  ),
  async (req, res) => {
    const { username, name } = req.params;

    const { schema } = req.body;
    const stringSchema = JSON.stringify(schema);

    const { id: userId } = await findUserByUsername(username);
    const schemaSaved = await createSchema(userId, name, stringSchema);
    res
      .status(200)
      .json({ message: "Json schema created!", schema: schemaSaved });
  }
);

jsonSchemasRouter.put(
  "/:username/:name",
  validateParamsMiddleware(createUpdateSchemaParams),
  validateBodyMiddleware(createUpdateSchemaBody),
  sameUserAuthorization(
    (user) => user.username,
    (req) => req.username
  ),
  async (req, res) => {
    const { username, name } = req.params;

    const { schema } = req.body;
    const stringSchema = JSON.stringify(schema);

    const { id: userId } = await findUserByUsername(username);
    const schemaUpdated = await updateSchema(userId, name, stringSchema);
    res
      .status(200)
      .json({ message: "Json schema updated!", schema: schemaUpdated });
  }
);

jsonSchemasRouter.delete(
  "/:username/:name",
  validateParamsMiddleware(createUpdateSchemaParams),
  sameUserAuthorization(
    (user) => user.username,
    (req) => req.username
  ),
  async (req, res) => {
    const { username, name } = req.params;
    await deleteSchemaByUsernameAndName(username, name);
    res.status(200).json({ message: "Json schema deleted." });
  }
);

jsonSchemasRouter.get(
  "/:username",
  validateParamsMiddleware(getSchemasParams),
  validateQueryMiddleware(getSchemasQuery),
  sameUserAuthorization(
    (user) => user.username,
    (req) => req.username
  ),
  async (req, res) => {
    const { username } = req.params;
    const { limit, offset } = req.query;

    const parsedLimit = parseInt(limit) || 20;
    const parsedOffset = parseInt(offset) || 0;
    const schemas = await getSchemasPaginated(
      username,
      parsedLimit,
      parsedOffset
    );

    res.json({ schemas, limit: parsedLimit, offset: parsedOffset });
  }
);

export default jsonSchemasRouter;
