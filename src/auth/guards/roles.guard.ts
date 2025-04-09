import { CanActivate, Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enum/role.enum'; // Переконайтеся, що шлях правильний
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

    // const { user } = context.switchToHttp().getRequest();

    // if (!user || !user.roles) {
    //   return false; // Якщо користувач або його ролі не визначені, забороняємо доступ
    // }

    // return requiredRoles.some((role) => user.roles.includes(role));
    const role = context.switchToHttp().getRequest();
    const rolesArr = role.body.roles;
    return requiredRoles.some((roles) => rolesArr.includes(roles));
  }
}
