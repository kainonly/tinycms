# TinyCMS

A lightweight CMS for quickly customizing web pages

![snapshot.png](snapshot.png)

## Setup

The project uses **NextJS** and **PostgreSQL**, use this template and create a new repository

1. Run `npm install`
2. Edit `.env` file and run `npm run pwd:generate` give the password to `ADMIN_TOKEN`
3. Run `npm run migrate:dev` and then `npm run db:seed`

Finally, it can be customized.

## Env

```
NAME=tinycms
KEY=<Application Key 32>
DATABASE_URL=postgresql://postgres:123456@localhost:5432/tinycms
ADMIN_USER=super
ADMIN_TOKEN=< base64(argon2id(you password)) >
PUBLIC_URL=< cdn url, like `https://cdn.kainonly.com/` >
S3_ACCESSKEYID=< s3 accessKeyId >
S3_SECRETACCESSKEY=< s3 secertAccessKey >
S3_REGION=< ... >
S3_ENDPOINT=< ... >
S3_BUCKET=< ... >
```

## License

[BSD-3-Clause License](https://github.com/kainonly/tinycms/blob/main/LICENSE)
