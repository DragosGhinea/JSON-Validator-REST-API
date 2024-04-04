const validateMiddlewareAbstract = (toValidateSupplier) => (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(toValidateSupplier(req));
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    next();
  };
};

const validateBodyMiddleware = validateMiddlewareAbstract((req) => req.body);

const validateParamsMiddleware = validateMiddlewareAbstract(
  (req) => req.params
);

const validateQueryMiddleware = validateMiddlewareAbstract((req) => req.query);

export {
  validateBodyMiddleware,
  validateParamsMiddleware,
  validateQueryMiddleware,
};
