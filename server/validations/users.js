import Joi from "joi";

const idParamSchema = Joi.object({
  id: Joi.string().required(),
});

const userUpdateSchema = Joi.object({
  user: Joi.object({
    email: Joi.string().email(),
    password: Joi.string().min(6),
    username: Joi.string().alphanum().min(3),
  }).required(),
});

const usernameChangeSchema = Joi.object({
  username: Joi.string().alphanum().min(3).required(),
});

export { idParamSchema, userUpdateSchema, usernameChangeSchema };
