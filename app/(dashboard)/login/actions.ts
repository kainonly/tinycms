'use server';

import { verify } from '@node-rs/argon2';
import { AES } from 'crypto-js';
import { cookies } from 'next/headers';

import { config } from '@bootstrap';

export type LoginDto = {
  username: string;
  password: string;
};

export async function login(dto: LoginDto): Promise<boolean> {
  if (dto.username !== config.admin.user) {
    return false;
  }
  const check = await verify(config.admin.token, dto.password);
  if (check) {
    const session = JSON.stringify({ user: config.admin.user });
    const encrypted = AES.encrypt(session, config.key).toString();
    cookies().set('session', encrypted, {
      secure: config.production,
      path: '/',
      httpOnly: true,
      sameSite: 'strict'
    });
  }
  return check;
}
