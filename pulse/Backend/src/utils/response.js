export const sendSuccess = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({ data });
};

export const sendError = (res, message, code = 'BAD_REQUEST', statusCode = 400) => {
  return res.status(statusCode).json({
    error: {
      message,
      code,
    },
  });
};
