import { callbackQuery } from 'telegraf/filters'
import { Context } from '..'
import prisma from '../utils/prisma'
import i18n from '../utils/i18n'
import keyboards from '../keyboards'

export default async (ctx: Context) => {
    if (!ctx.has(callbackQuery('data'))) return
    const id = Number(ctx.callbackQuery.data.split('_')[1])
    let userId: number
    if (id > 1000) {
        userId = id
    } else {
        userId = Number((await prisma.profile.findUnique({ where: { id } }))?.userId)
    }
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return await ctx.reply('User not found')
    await prisma.user.update({ where: { id: user.id }, data: { warns: { increment: 1 } } })
    await ctx.reply('Warned!')
    await ctx.telegram.sendMessage(Number(user.id), i18n.t(user.language, 'message:getWarned'))
    if (user.warns + 1 >= 3) {
        await prisma.user.update({ where: { id: user.id }, data: { banned: true, disabled: true } })
        await ctx.reply('Banned!')
        await ctx.telegram.sendMessage(Number(user.id), i18n.t(user.language, 'message:getBanned'), keyboards.empty)
    }
}
