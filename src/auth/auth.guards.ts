import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constans';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {} // Додаємо конструктор для DI

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // підтримку публічних маршрутів через метадані
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );

    if (isPublic) {
      return true;
    }
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token not found');
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });
      request.user = payload;
      // request['user'] = payload; // Додаємо розпізнаного користувача до запиту
      console.log('Verified payload:', payload);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer')) {
      return undefined; // Якщо заголовок відсутній
    }

    // const [type, token] = authHeader?.split(' ') ?? [];
    // return type === 'Bearer' ? token : undefined;
    // ✅ Надійніше виділення токена
    return authHeader.split(' ')[1];
  }
}
