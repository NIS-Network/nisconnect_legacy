import { Context } from '..'
import keyboards from '../keyboards'
import i18n from '../utils/i18n'
import prisma from '../utils/prisma'

export default async (ctx: Context) => {
    if (ctx.session.user.status != 'chatting' || !ctx.session.user.partner) return
    const partner = await prisma.user.findUnique({ where: { id: ctx.session.user.partner } })
    if (!partner) {
        return (ctx.session.user = await prisma.user.update({ where: { id: ctx.session.user.id }, data: { status: 'default', partner: null } }))
    }
    await prisma.user.update({ where: { id: partner.id }, data: { status: 'default', partner: null } }).catch(console.log)
    ctx.session.user = await prisma.user.update({ where: { id: ctx.session.user.id }, data: { status: 'default', partner: null } })
    await ctx.telegram.sendMessage(Number(partner.id), i18n.t(partner.language, 'message:partnerDisconected'), { reply_markup: keyboards.main(partner.language, 'default').reply_markup })
    await ctx.reply(i18n.t(ctx.session.user.language, 'message:youDisconnected'), keyboards.main(ctx.session.user.language, 'default'))
}
