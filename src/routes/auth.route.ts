import validateRequest from '../middleware/validator.middleware';
import { CreateUserDTO, LoginUserDTO } from '../dtos/user.dto';
import {
  createUser,
  loginUser,
  logoutUser,
} from '../controller/user.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { Request, Response, Router } from 'express';

const router = Router();

router.post('/signup', validateRequest(CreateUserDTO), createUser);

router.post('/signin', validateRequest(LoginUserDTO), loginUser);

router.post('/signout', verifyToken, logoutUser);

router.get('/protected', verifyToken, (req: Request, res: Response) => {
  res.send(req?.user);
});

export default router;
