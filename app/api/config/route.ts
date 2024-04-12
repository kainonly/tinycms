'use server';

import { config } from '@bootstrap';

export async function GET() {
  return Response.json({ public_url: config.public_url });
}
