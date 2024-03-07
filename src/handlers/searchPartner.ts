import { Context } from '..'
import keyboards from '../keyboards'
import { i18n } from '../utils/i18n'
import prisma from '../utils/prisma'

export default async (ctx: Context) => {
    if (!ctx.user || !ctx.profile) return
    if (ctx.user.status == 'chatting') {
        return await ctx.reply(i18n.t(ctx.user.language, 'message:havePartner'), keyboards.main(ctx.user.language, 'chatting'))
    } else if (ctx.user.status == 'searching') {
        return await ctx.reply(i18n.t(ctx.user.language, 'message:searchingPartner'), keyboards.main(ctx.user.language, 'searching'))
    }
    const queue = await prisma.queue.findMany({
        where: {
            genderPreference: {
                in: ['all', ctx.profile.gender],
            },
            gender: ctx.profile.genderPreference == 'all' ? undefined : ctx.profile.genderPreference,
        },
        orderBy: {
            createdAt: 'asc',
        },
    })
    if (queue.length == 0) {
        await prisma.queue.create({ data: { gender: ctx.profile.gender, genderPreference: ctx.profile.genderPreference, user: ctx.user.id } }).catch(console.log)
        await prisma.user.update({ where: { id: ctx.user.id }, data: { status: 'searching' } }).catch(console.log)
        if (ctx.profile.genderPreference == 'male') {
            return await ctx.reply(i18n.t(ctx.user.language, 'message:foundMale', { partner: 0 }), keyboards.main(ctx.user.language, 'searching'))
        } else if (ctx.profile.genderPreference == 'female') {
            return await ctx.reply(i18n.t(ctx.user.language, 'message:foundFemale', { partner: 0 }), keyboards.main(ctx.user.language, 'searching'))
        } else {
            return await ctx.reply(i18n.t(ctx.user.language, 'message:foundAll', { partner: 0 }), keyboards.main(ctx.user.language, 'searching'))
        }
    }
    const partner = await prisma.user.findUnique({ where: { id: queue[0].user } })
    if (!partner) {
        await prisma.user.update({ where: { id: ctx.user.id }, data: { status: 'default', partner: null } })
        return
    }
    await prisma.user.update({ where: { id: partner.id }, data: { status: 'chatting', partner: ctx.user.id } }).catch(console.log)
    await prisma.user.update({ where: { id: ctx.user.id }, data: { status: 'chatting', partner: partner.id } }).catch(console.log)
    await prisma.queue.delete({ where: { id: queue[0].id } }).catch(console.log)
    await ctx.telegram.sendMessage(Number(partner.id), i18n.t(partner.language, 'message:foundPartner'), { reply_markup: keyboards.main(partner.language, 'chatting').reply_markup })
    return await ctx.reply(i18n.t(ctx.user.language, 'message:foundPartner'), keyboards.main(ctx.user.language, 'chatting'))
}
