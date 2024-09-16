import { Request, Response } from 'express';
import { checkHealth } from '../utils/healthCheck';
import { ResponseHandler } from '../utils/responseHandler';

export const getHealthStatus = async (_req: Request, res: Response) => {
  try {
    const healthStatus = await checkHealth();
    const overallStatus = Object.values(healthStatus).every(
      (status) => status.status === 'ok',
    )
      ? 'ok'
      : 'error';

    res.status(overallStatus === 'ok' ? 200 : 503).json({
      status: overallStatus,
      components: healthStatus,
    });
  } catch (error) {
    ResponseHandler.internalError(res, 'Health check failed', error);
  }
};
