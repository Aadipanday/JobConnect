/**
 * Higher-order async handler function to eliminate try-catch boilerplate in Express controllers
 * @param {Function} requestHandler - Asynchronous Express controller function
 * @returns {Function} Express middleware function
 */
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };
export default asyncHandler;
