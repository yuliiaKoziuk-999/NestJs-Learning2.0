import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constans';
import { Reflector } from '@nestjs/core';


@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {} // Додаємо конструктор для DI

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler());
   
    if (isPublic) {
      return true;
    }
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const data=this.jwtService.decode(token);
      const playload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
  
      });
      request['user'] = data; // Додаємо розпізнаного користувача до запиту
      console.log(`DATA: ${data}`)
      console.log(`PLAYLOAD: ${playload}`);
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return undefined; // Якщо заголовок відсутній
    }

    const [type, token] = authHeader?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
