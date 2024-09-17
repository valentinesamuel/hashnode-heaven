import jwt from 'jsonwebtoken';
import { secretKey, jwtExpiration } from '../config/jwtConfig';

export function generateToken(payload: string | Buffer | object) {
  return jwt.sign(payload, secretKey, {
    expiresIn: jwtExpiration,
  });
}

export function decodeToken(token: string) {
  return jwt.decode(token);
}
