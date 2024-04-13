import { hash } from '@node-rs/argon2';

async function main() {
  console.log(`ADMIN_TOKEN: `, await hash('pass@VAN1234'));
}

main();
