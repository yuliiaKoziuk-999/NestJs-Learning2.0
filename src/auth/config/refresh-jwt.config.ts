import { registerAs } from '@nestjs/config';
import { JwtSignOptions } from '@nestjs/jwt';

export default registerAs(
  'refresh-jwt',
  (): JwtSignOptions => ({
    // Секрет для генерації refresh токена
    secret: process.env.REFRESH_JWT_SECRET,

    // Термін дії токена, наприклад '7d' для 7 днів
    expiresIn: process.env.REFRESH_JWT_EXPIRE_IN,
  }),
);
