import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { v4 as uuidv4 } from 'uuid';
import { generateToken } from '../services/jwt.service';
import {
  blacklistToken,
  setSessionIdInRedis,
  setTokenInRedis,
} from '../services/redis.service';
import { ResponseHandler } from '../utils/responseHandler';

const userService = new UserService();

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const sessionId = uuidv4();
    const token = generateToken({ userId, sessionId });

    setTokenInRedis({ token, userId, sessionId });
    setSessionIdInRedis({
      sessionId,
      userId,
      token,
    });

    const newUser = await userService.createUser(userId);

    if (!newUser) {
      return ResponseHandler.badRequest(res, 'Failed to create user');
    }

    return ResponseHandler.created(
      res,
      { token, ...newUser },
      'User created successfully',
    );
  } catch (error) {
    return ResponseHandler.internalError(res, 'Failed to create user', error);
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    const blacklisted = await blacklistToken(token as string);

    if (!blacklisted) {
      return ResponseHandler.badRequest(res, 'Failed to blacklist token');
    }

    return ResponseHandler.success(res, 'User logged out successfully');
  } catch (error) {
    return ResponseHandler.internalError(res, 'Failed to logout user', error);
  }
};
