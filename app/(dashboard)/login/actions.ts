'use server';

import { config, db } from '@bootstrap';
import { verify } from '@node-rs/argon2';
import { AES } from 'crypto-js';
import { cookies } from 'next/headers';

export type LoginDto = {
  username: string;
  password: string;
};

export async function login(dto: LoginDto): Promise<boolean> {
  const data = await db.user.findUnique({ where: { email: dto.username, status: true } });
  if (!data) {
    return false;
  }
  const check = await verify(data.password, dto.password);
  if (check) {
    const encrypted = AES.encrypt(data.email, config.key).toString();
    cookies().set('session', encrypted, {
      secure: config.production,
      path: '/',
      httpOnly: true,
      sameSite: 'strict'
    });
  }
  return check;
}
