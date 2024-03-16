import { Context } from '..'
import keyboards from '../keyboards'
import { i18n } from '../utils/i18n'
import prisma from '../utils/prisma'

export default async (ctx: Context) => {
    if (ctx.session.user.status == 'chatting') {
        return await ctx.reply(i18n.t(ctx.session.user.language, 'message:havePartner'), keyboards.main(ctx.session.user.language, 'chatting'))
    } else if (ctx.session.user.status == 'searching') {
        return await ctx.reply(i18n.t(ctx.session.user.language, 'message:searchingPartner'), keyboards.main(ctx.session.user.language, 'searching'))
    }
    const queue = await prisma.queue.findMany({
        where: {
            genderPreference: {
                in: ['all', ctx.session.profile.gender],
            },
            gender: ctx.session.profile.genderPreference == 'all' ? undefined : ctx.session.profile.genderPreference,
        },
        orderBy: {
            createdAt: 'asc',
        },
    })
    if (queue.length == 0) {
        await prisma.queue.create({ data: { gender: ctx.session.profile.gender, genderPreference: ctx.session.profile.genderPreference, user: ctx.session.user.id } }).catch(console.log)
        ctx.session.user = await prisma.user.update({ where: { id: ctx.session.user.id }, data: { status: 'searching' } })
        const word = ctx.session.profile.genderPreference
        return await ctx.reply(
            i18n.t(ctx.session.user.language, `message:found${word.charAt(0).toUpperCase() + word.slice(1)}`, { partner: 0 }),
            keyboards.main(ctx.session.user.language, 'searching'),
        )
    }
    const partner = await prisma.user.findUnique({ where: { id: queue[0].user } })
    if (!partner) {
        return (ctx.session.user = await prisma.user.update({ where: { id: ctx.session.user.id }, data: { status: 'default', partner: null } }))
    }
    await prisma.user.update({ where: { id: partner.id }, data: { status: 'chatting', partner: ctx.session.user.id } }).catch(console.log)
    ctx.session.user = await prisma.user.update({ where: { id: ctx.session.user.id }, data: { status: 'chatting', partner: partner.id } })
    await prisma.queue.delete({ where: { id: queue[0].id } }).catch(console.log)
    await ctx.telegram.sendMessage(Number(partner.id), i18n.t(partner.language, 'message:foundPartner'), { reply_markup: keyboards.main(partner.language, 'chatting').reply_markup })
    return await ctx.reply(i18n.t(ctx.session.user.language, 'message:foundPartner'), keyboards.main(ctx.session.user.language, 'chatting'))
}
