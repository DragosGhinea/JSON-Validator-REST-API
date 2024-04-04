import Joi from "joi";

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().pattern(/^\S+$/).required().messages({
    "string.pattern.base": "Password cannot contain spaces",
  }),
});

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().pattern(/^\S+$/).required().messages({
    "string.pattern.base": "Password cannot contain spaces",
  }),
  username: Joi.string().alphanum().required().messages({
    "string.alphanum": "Username must be alphanumeric",
  }),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

export { loginSchema, registerSchema, refreshTokenSchema };
