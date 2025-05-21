import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { API_KEY } from '../middleware/constants';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-api-key'];
    
    console.log(`Requested path: ${request.path}`);
    console.log(`API Key provided: ${apiKey}`);

    if (!apiKey || apiKey !== API_KEY) {
      console.log(`Invalid or missing API key for path: ${request.path}`);
      throw new UnauthorizedException('Invalid or missing API key');
    }

    console.log(`Valid API key for path: ${request.path}`);
    return true;
  }
} 