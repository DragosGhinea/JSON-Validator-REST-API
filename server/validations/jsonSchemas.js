import Joi from "joi";

const validateSchemaParams = Joi.object({
  username: Joi.string().required(),
  name: Joi.string().required(),
});

const validateSchemaBody = Joi.object({
  jsonToValidate: Joi.object().required(),
});

const createUpdateSchemaParams = Joi.object({
  username: Joi.string().required(),
  name: Joi.string().required(),
});

const createUpdateSchemaBody = Joi.object({
  schema: Joi.object().required(),
});

const getSchemasParams = Joi.object({
  username: Joi.string().required(),
});

const getSchemasQuery = Joi.object({
  limit: Joi.number().integer().min(1).max(100),
  offset: Joi.number().integer().min(0),
});

export {
  validateSchemaParams,
  validateSchemaBody,
  createUpdateSchemaParams,
  createUpdateSchemaBody,
  getSchemasParams,
  getSchemasQuery,
};
