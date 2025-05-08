import {
  CanActivate,
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../auth/enum/role.enum'; // Піднімаємося на два рівні вище
import { ROLES_KEY } from '../../auth/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    console.log({ user });
    console.log('requiredRoles:', requiredRoles);

    if (!requiredRoles || requiredRoles.length === 0) return true;

    if (!user || !user.role) {
      throw new UnauthorizedException('User not found or role is missing');
    }

    const hasRequiredRole = requiredRoles.some((role) => user.role === role);
    if (!hasRequiredRole) {
      throw new UnauthorizedException('You do not have the required role');
    }

    return true;
  }
}
