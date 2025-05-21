import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { API_KEY } from './constants';
import { API_PREFIX } from '../../shared/constants/app.constants';

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  private readonly API_KEY = API_KEY;
  private readonly excludedPaths = ['/', '/health', `/${API_PREFIX}`, `/${API_PREFIX}/health`];

  use(req: Request, res: Response, next: NextFunction) {
    const path = req.path.split('?')[0];
    
    console.log(`Checking path: ${path}`);
    
    // Skip API key check for excluded paths
    if (this.excludedPaths.some(excludedPath => path === excludedPath || path.endsWith(excludedPath))) {
      console.log(`Path ${path} is excluded from API key check`);
      return next();
    }
    
    const apiKey = req.headers['x-api-key'];
    console.log(`Received API key: ${apiKey}`);
    
    if (!apiKey || apiKey !== this.API_KEY) {
      console.log(`Invalid or missing API key for path: ${path}`);
      throw new UnauthorizedException('Invalid or missing API key');
    }
    
    console.log(`Valid API key for path: ${path}`);
    next();
  }
} 