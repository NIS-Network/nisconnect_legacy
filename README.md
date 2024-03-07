1. [Install pnpm](https://pnpm.io/installation/ 'pnpm installation')
2. `pnpm install`
3. create `.env` file. Sample:  
   `BOT_TOKEN="6377745274:AAGISAAte6v994wW2Hc4NbeYuR47KTgRqPU"` `DATABASE_URL="postgres://postgres.hello:pass@aws.pooler.supabase.com:5432/postgres"`
4. `npx prisma generate`
5. `pnpm build`
6. copy `src/locales` directory into `dist` directory
7. `pnpm start`

TODO: edit translations
