import { AppError } from '../utils/AppError.js';

export function validate(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      const details = result.error.flatten().fieldErrors;
      return next(new AppError('Validation failed', 400, details));
    }

    const { body, query, params } = result.data;
    if (body) req.body = body;
    if (query) req.query = query;
    if (params) req.params = params;

    next();
  };
}
