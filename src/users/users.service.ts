import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class UsersService {
  //DB
  // postgresql://neondb_owner:npg_XyuFp8LEQc1A@ep-sweet-bird-a5ipjx5t-pooler.us-east-2.aws.neon.tech/myDB?sslmode=require
  private users = [
    {
      id: 1,
      name: 'Julia',
      email: 'julia@gmail.com',
      role: 'ENGINEER',
    },
    {
      id: 2,
      name: 'Jack',
      email: 'jack@gmail.com',
      role: 'ADMIN',
    },
    {
      id: 3,
      name: 'Jane',
      email: 'jane@gmail.com',
      role: 'INTERN',
    },
    {
      id: 4,
      name: 'Anton',
      email: 'anton@gmail.com',
      role: 'ENGINEER',
    },
    {
      id: 5,
      name: 'Anderw',
      email: 'andrew@gmail.com',
      role: 'ENGINEER',
    },
  ];

  findAll(role?: 'INTERN' | 'ENGINEER' | 'ADMIN') {
    if (role) {
      const rolesArray = this.users.filter((user) => user.role === role);
      if (rolesArray.length === 0)
        throw new NotFoundException('User Role Not Found');
      return rolesArray;
    }
    return this.users;
  }

  findOne(id: number) {
    const user = this.users.find((user) => user.id === id);

    if (!user) {
      throw new NotFoundException('User Not Found');
    }
    return user;
  }

  create(createUserDto: CreateUserDto) {
    const usersByHighestId = [...this.users].sort((a, b) => b.id - a.id);
    const newUser = {
      id: usersByHighestId[0].id + 1,
      ...createUserDto,
    };
    this.users.push(newUser);
    return newUser;
  }

  update(id: number, updatedUser: UpdateUserDto) {
    this.users = this.users.map((user) => {
      if (user.id === id) {
        return { ...user, ...updatedUser };
      }
      return user;
    });
    return this.findOne(id);
  }

  delete(id: number) {
    const removedUser = this.findOne(id);

    this.users = this.users.filter((user) => user.id !== id);

    return removedUser;
  }
}
