import { Context } from '..'
import keyboards from '../keyboards'
import prisma from '../utils/prisma'

export default async (ctx: Context) => {
    if (ctx.session.user.status != 'chatting' || !ctx.session.user.partner) return
    const partner = await prisma.user.findUnique({ where: { id: ctx.session.user.partner } })
    if (!partner) {
        return (ctx.session.user = await prisma.user.update({ where: { id: ctx.session.user.id }, data: { status: 'default', partner: null } }))
    }
    await prisma.user.update({ where: { id: partner.id }, data: { status: 'default', partner: null } }).catch(console.log)
    ctx.session.user = await prisma.user.update({ where: { id: ctx.session.user.id }, data: { status: 'default', partner: null } })
    await ctx.telegram.sendMessage(Number(partner.id), 'Your partner have disconnected', { reply_markup: keyboards.main(partner.language, 'default').reply_markup })
    await ctx.reply('You have disconnected', keyboards.main(ctx.session.user.language, 'default'))
}
