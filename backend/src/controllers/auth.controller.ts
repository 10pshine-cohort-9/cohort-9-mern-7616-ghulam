import type { Request, Response } from 'express';

import { authService } from '../services/auth.service';
import { logger } from '../config/logger';
import type { AuthenticatedRequest } from '../types/auth.types';

export const authController = {
  async signup(req: Request, res: Response): Promise<void> {
    const result = await authService.signup(req.body);

    logger.info({ userId: result.user._id }, 'Signup successful');

    res.status(201).json({
      success: true,
      data: result,
      message: 'User registered successfully',
    });
  },

  async login(req: Request, res: Response): Promise<void> {
    const result = await authService.login(req.body);

    logger.info({ userId: result.user._id }, 'Login successful');

    res.status(200).json({
      success: true,
      data: result,
      message: 'Login successful',
    });
  },

  async getProfile(req: Request, res: Response): Promise<void> {
    const { userId } = (req as AuthenticatedRequest).user;
    const user = await authService.getProfile(userId);

    res.status(200).json({
      success: true,
      data: { user },
      message: 'Profile retrieved successfully',
    });
  },

  async logout(_req: Request, res: Response): Promise<void> {
    // JWT is stateless — logout is handled client-side by removing the token.
    // This endpoint exists for API completeness and logging.
    res.status(200).json({
      success: true,
      data: null,
      message: 'Logged out successfully',
    });
  },
};
