export const errorHandler = (err, req, res, next) => {
  // Handle mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: {
        message: `Invalid ${err.path}: ${err.value}`,
        code: 'MALFORMED_ID',
      },
    });
  }

  // Handle mongoose ValidationError
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      error: {
        message: messages.join(', '),
        code: 'VALIDATION_ERROR',
      },
    });
  }

  // Handle JSON parse error from express.json()
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: {
        message: 'Invalid JSON payload in request body',
        code: 'INVALID_JSON',
      },
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  const code = err.code || 'INTERNAL_SERVER_ERROR';

  return res.status(statusCode).json({
    error: {
      message: statusCode === 500 ? 'An unexpected error occurred' : message,
      code,
    },
  });
};

export default errorHandler;
