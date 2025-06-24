import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({ example: 'access-token-example' })
  accessToken: string;

  @ApiProperty({ example: 'refresh-token-example' })
  refreshToken: string;

  @ApiProperty({ example: 2 })
  id: number;
}
