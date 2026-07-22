/**
 * Validates a request section (body/query/params) against a Zod schema.
 * On success the parsed & coerced value replaces the original section.
 */
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed.',
        details: result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }
    req[source] = result.data;
    next();
  };
}
