import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLES_KEY } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enum/role.enum';

//Reflector — це спеціальний сервіс NestJS, який дозволяє отримувати метадані
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const user = context.switchToHttp().getRequest().user;
    const hasRequiredRole = requiredRoles.some((role) => user.role === role);
    return hasRequiredRole;
  }
}
