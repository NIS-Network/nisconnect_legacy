import { Context } from '..'

export default async (ctx: Context, next: () => Promise<void>) => {
    if (ctx.session.user.role == 'admin' || ctx.session.user.role == 'superadmin') return next()
    return
}
