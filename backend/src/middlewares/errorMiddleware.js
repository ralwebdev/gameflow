export function notFound(request, _response, next) {
  const error = new Error(`Route not found: ${request.originalUrl}`)
  error.statusCode = 404
  next(error)
}

export function errorHandler(error, _request, response, _next) {
  const statusCode = error.statusCode || 500
  const message =
    statusCode === 500
      ? 'Something went wrong while handling the request.'
      : error.message

  if (statusCode === 500) {
    console.error(error)
  }

  response.status(statusCode).json({ message })
}
