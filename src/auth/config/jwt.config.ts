import { registerAs } from '@nestjs/config';

export default registerAs('refreshJwt', () => ({
  refreshTokenSecret: process.env.REFRESH_JWT_SECRET,
  refreshTokenExpiresIn: process.env.REFRESH_JWT_EXPIRES_IN || '7d',
}));
