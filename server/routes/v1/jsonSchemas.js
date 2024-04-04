/**
 * @swagger
 * components:
 *   schemas:
 *     JsonSchema:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The unique identifier of the schema.
 *         name:
 *           type: string
 *           description: The name of the schema.
 *         schema:
 *           type: string
 *           description: The JSON schema definition.
 *       required:
 *         - id
 *         - name
 *         - schema
 *
 *     JsonSchemaValidationResponse:
 *       type: object
 *       properties:
 *         valid:
 *           type: boolean
 *           description: Indicates whether the JSON validates against the schema.
 *       required:
 *         - valid
 *
 *     JsonSchemaPaginatedResponse:
 *       type: object
 *       properties:
 *         schemas:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/JsonSchema'
 *           description: List of JSON schemas.
 *         limit:
 *           type: integer
 *           description: Number of schemas per page.
 *         offset:
 *           type: integer
 *           description: Offset for pagination.
 *       required:
 *         - schemas
 *         - limit
 *         - offset
 */

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

/**
 * @swagger
 * /v1/schemas/{username}/{name}/validate:
 *   post:
 *     summary: Validate JSON against schema.
 *     tags:
 *       - JSON Schemas
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: User's username
 *       - in: path
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: Schema name
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JsonSchemaValidationResponse'
 *     responses:
 *       '200':
 *         description: Validation result.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JsonSchemaValidationResponse'
 *       '404':
 *         description: Schema not found.
 */
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

/**
 * @swagger
 * /v1/schemas/{username}/{name}:
 *   get:
 *     summary: Get JSON schema by username and name.
 *     tags:
 *       - JSON Schemas
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: User's username
 *       - in: path
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: Schema name
 *     responses:
 *       '200':
 *         description: Schema found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JsonSchema'
 *       '404':
 *         description: Schema not found.
 */
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

/**
 * @swagger
 * /v1/schemas/{username}/{name}:
 *   post:
 *     summary: Create JSON schema.
 *     tags:
 *       - JSON Schemas
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: User's username
 *       - in: path
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: Schema name
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JsonSchema'
 *     responses:
 *       '200':
 *         description: Schema created.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JsonSchema'
 */
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

/**
 * @swagger
 * /v1/schemas/{username}/{name}:
 *   put:
 *     summary: Update JSON schema.
 *     tags:
 *       - JSON Schemas
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: User's username
 *       - in: path
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: Schema name
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JsonSchema'
 *     responses:
 *       '200':
 *         description: Schema updated.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JsonSchema'
 *       '404':
 *         description: Schema not found.
 */
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

/**
 * @swagger
 * /v1/schemas/{username}/{name}:
 *   delete:
 *     summary: Delete JSON schema.
 *     tags:
 *       - JSON Schemas
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: User's username
 *       - in: path
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: Schema name
 *     responses:
 *       '200':
 *         description: Schema deleted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Deletion success message.
 */
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

/**
 * @swagger
 * /v1/schemas/{username}:
 *   get:
 *     summary: Get JSON schemas by username.
 *     tags:
 *       - JSON Schemas
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: User's username
 *     responses:
 *       '200':
 *         description: Schemas found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JsonSchemaPaginatedResponse'
 */
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
