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
import { CreateUserDTO, LoginUserDTO } from '../dtos/user.dto';

const userService = new UserService();

export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body as CreateUserDTO;

    const newUser = await userService.createUser({ username, email, password });
    if (!newUser) {
      return ResponseHandler.badRequest(res, 'Failed to create user');
    }

    const { id } = newUser;
    const sessionId = uuidv4();
    const userId = String(id);
    const token = generateToken({ username, userId, sessionId });

    await setTokenInRedis({ token, userId, sessionId });
    await setSessionIdInRedis({
      sessionId,
      userId,
      token,
    });

    return ResponseHandler.created(
      res,
      { token, ...newUser },
      'User created successfully',
    );
  } catch (error) {

    return ResponseHandler.internalError(res, 'Failed to create user', error);
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body as LoginUserDTO;

    const user = await userService.getUserByUsername(username);
    if (!user) {
      return ResponseHandler.badRequest(res, 'Incorrect Credentials');
    }
    const correctPassword = userService.comparePassword(
      password,
      user.password,
    );
    if (!correctPassword) {
      return ResponseHandler.badRequest(res, 'Incorrect Credentials');
    }

    const userId = String(user.id);

    const sessionId = uuidv4();
    const token = generateToken({ userId, sessionId });

    await setTokenInRedis({ token, userId, sessionId });
    await setSessionIdInRedis({
      sessionId,
      userId,
      token,
    });

    const serializedUser = userService.serializeUser(user);
    return ResponseHandler.created(
      res,
      { token, ...serializedUser },
      'Successfully signed in user',
    );
  } catch (error) {
    return ResponseHandler.internalError(res, 'Failed to sign in user', error);
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
