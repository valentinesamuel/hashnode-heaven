import { Response } from 'express';
import { StatusCodes, ReasonPhrases, getReasonPhrase } from 'http-status-codes';

class ResponseHandler {
  static success(res: Response, data: unknown, message?: string) {
    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: (message ?? ReasonPhrases.OK) || getReasonPhrase(StatusCodes.OK),
      data,
    });
  }

  static created(res: Response, data: unknown, message?: string) {
    return res.status(StatusCodes.CREATED).json({
      status: 'success',
      message:
        (message ?? ReasonPhrases.CREATED) ||
        getReasonPhrase(StatusCodes.CREATED),
      data,
    });
  }

  static error(
    res: Response,
    statusCode: number,
    message: string,
    details?: unknown,
  ) {
    return res.status(statusCode).json({
      status: 'error',
      message: message || getReasonPhrase(statusCode),
      details,
    });
  }

  static badRequest(res: Response, message: string, details?: unknown) {
    return this.error(
      res,
      StatusCodes.BAD_REQUEST,
      message || getReasonPhrase(StatusCodes.BAD_REQUEST),
      details,
    );
  }

  static notFound(res: Response, message: string, details?: unknown) {
    return this.error(
      res,
      StatusCodes.NOT_FOUND,
      message || getReasonPhrase(StatusCodes.NOT_FOUND),
      details,
    );
  }

  static internalError(res: Response, message: string, details?: unknown) {
    return this.error(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      message || getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
      details,
    );
  }
}

export { ResponseHandler };
