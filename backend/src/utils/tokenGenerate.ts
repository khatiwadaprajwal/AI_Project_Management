import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export const generateAccessToken = (userId: string): string => {
  return jwt.sign(
    { id: userId }, 
    env.JWT_SECRET, 
    { expiresIn: '5d' }
  );
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign(
    { id: userId }, 
    env.JWT_REFRESH_SECRET, 
    { expiresIn: '7d' }
  );
};