import Ajv from "ajv";
import betterAjvErrors from "@sidvind/better-ajv-errors";
const ajv = new Ajv({ allErrors: true });

export const validateSchema = (schema, data) => {
  const validate = ajv.compile(schema);
  validate(data);
  return betterAjvErrors(schema, data, validate.errors, { format: "js" });
};
