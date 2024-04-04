function authorizationMiddleware(reqResEvaluator) {
  return async (req, res, next) => {
    const resError = await reqResEvaluator(req, res);
    if (!resError) {
      return next();
    }

    return resError;
  };
}

export const sameUserAuthorization =
  (userFieldToUseSupplier, userFieldSupplier) => (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "You must be logged in." });
    }

    // console.log(userFieldToUseSupplier(req.user), userFieldSupplier(req));
    if (userFieldToUseSupplier(req.user) !== userFieldSupplier(req)) {
      return res
        .status(403)
        .json({ message: "You are not the user that owns this resource." });
    }

    next();
  };

export default authorizationMiddleware;
