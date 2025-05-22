import { User } from '../src/users/entities/user.entity';

export const mockUser1: User = {
  id: 1,
  email: 'user1@example.com',
  password: 'hashedPassword1',
  name: 'Test User 1',
  // додай інші обов’язкові поля, якщо є
};

export const mockUser2: User = {
  id: 2,
  email: 'user2@example.com',
  password: 'hashedPassword2',
  name: 'Test User 2',
  // додай інші обов’язкові поля, якщо є
};

export const mockUser3: User = {
  id: 3,
  email: 'user3@example.com',
  password: 'hashedPassword3',
  name: 'Test User 3',
  // додай інші обов’язкові поля, якщо є
};

export const mockUser4: User = {
  id: 4,
  email: 'user4@example.com',
  password: 'hashedPassword4',
  name: 'Test User 4',
  // додай інші обов’язкові поля, якщо є
};

export const mockUser5: User = {
  id: 5,
  email: 'user5@example.com',
  password: 'hashedPassword5',
  name: 'Test User 5',
  // додай інші обов’язкові поля, якщо є
};

export const mockUsers: User[] = [
  mockUser1,
  mockUser2,
  mockUser3,
  mockUser4,
  mockUser5,
];
