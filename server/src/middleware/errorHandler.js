export function notFound(_req, res) {
  res.status(404).json({ error: 'Resource not found.' });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  if (status >= 500) {
    console.error('[error]', err);
  }
  res.status(status).json({
    error: err.expose ? err.message : status >= 500 ? 'Internal server error.' : err.message,
  });
}

export function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  err.expose = true;
  return err;
}
