const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: Object.values(err.errors).map(error => error.message)
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      error: 'Duplicate Key Error',
      message: 'A record with that unique field already exists'
    });
  }

  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong on the server'
  });
};

module.exports = errorHandler;
