import { Context } from '..'
import keyboards from '../keyboards'
import i18n from '../utils/i18n'
import prisma from '../utils/prisma'

export default async (ctx: Context) => {
    if (ctx.session.user.status != 'searching') return
    await prisma.queue.delete({ where: { user: ctx.session.user.id } }).catch(console.log)
    ctx.session.user = await prisma.user.update({ where: { id: ctx.session.user.id }, data: { status: 'default' } })
    await ctx.reply(i18n.t(ctx.session.user.language, 'message:stopedSearching'), keyboards.main(ctx.session.user.language, 'default'))
}
