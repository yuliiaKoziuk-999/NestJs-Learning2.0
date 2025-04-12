import {
  CanActivate,
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enum/role.enum'; // Переконайтесь, що шлях правильний
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // Якщо ролі не задані, дозволяємо доступ
    }

    const request = context.switchToHttp().getRequest();
    console.log(request.user);

    const user = request.user;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.role) {
      throw new UnauthorizedException('Role not found for the user');
    }

    // return requiredRoles.some((role) => rolesArr.includes(role));
    const rolesArr = Array.isArray(request.user?.role)
      ? request.user.role
      : [request.user?.role]; // перетворити на масив, якщо це один рядок

    return requiredRoles.some((role) => rolesArr.includes(role));
  }
}
