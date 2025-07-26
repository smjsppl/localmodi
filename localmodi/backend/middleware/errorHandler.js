const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = {
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong on our end'
    }
  };

  // Validation error (Joi)
  if (err.isJoi) {
    error.error.code = 'VALIDATION_ERROR';
    error.error.message = err.details[0].message;
    error.error.field = err.details[0].path[0];
    return res.status(400).json(error);
  }

  // OpenAI API errors
  if (err.name === 'OpenAIError') {
    error.error.code = 'LLM_ERROR';
    error.error.message = 'Failed to process text with AI service';
    return res.status(503).json(error);
  }

  // Rate limit error
  if (err.status === 429) {
    error.error.code = 'RATE_LIMIT_EXCEEDED';
    error.error.message = 'Too many requests, please try again later';
    return res.status(429).json(error);
  }

  // Custom application errors
  if (err.statusCode) {
    error.error.code = err.code || 'APPLICATION_ERROR';
    error.error.message = err.message;
    return res.status(err.statusCode).json(error);
  }

  // Default 500 error
  res.status(500).json(error);
};

module.exports = { errorHandler };
