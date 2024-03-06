import { Composer, Scenes } from 'telegraf'
import { Context } from '..'
import { i18n } from '../utils/i18n'
import { message } from 'telegraf/filters'
import keyboards from '../keyboards'
import login from '../utils/smsLogin'
import prisma from '../utils/prisma'

const cancel = async (ctx: Context, next: () => Promise<void>) => {
    if (!ctx.user || !ctx.profile) return await ctx.scene.leave()
    if (ctx.has(message('text'))) {
        if (ctx.message.text == i18n.t(ctx.user.language, 'button:cancel') || ctx.message.text == '/cancel') {
            await ctx.reply(i18n.t(ctx.user.language, 'message:canceled'), keyboards.main(ctx.user.language))
            return await ctx.scene.leave()
        }
    }
    return next()
}

const deleteHandler = new Composer<Context>()
deleteHandler.use(cancel)
deleteHandler.on(message('text'), async (ctx) => {
    if (!ctx.user) return await ctx.scene.leave()
    if (ctx.message.text != i18n.t(ctx.user.language, 'button:deleteUserAnyway')) return await ctx.reply(i18n.t(ctx.user.language, 'message:deleteUser'), keyboards.deleteUser(ctx.user.language))
    await ctx.reply(i18n.t(ctx.user.language, 'message:confirmPassword', { id: ctx.user.login }), keyboards.cancel(ctx.user.language))
    return ctx.wizard.next()
})

const confirmPasswordHandler = new Composer<Context>()
confirmPasswordHandler.use(cancel)
confirmPasswordHandler.on(message('text'), async (ctx) => {
    if (!ctx.user || !ctx.profile) return await ctx.scene.leave()
    const password = ctx.message.text
    const authorized = await login(ctx.user.login, password, ctx.user.city)
    if (!authorized) {
        await ctx.reply(i18n.t(ctx.user.language, 'message:wrongPassword'), keyboards.main(ctx.user.language))
        return await ctx.scene.leave()
    }
    await prisma.profile.delete({ where: { userId: ctx.message.from.id } })
    await prisma.user.delete({ where: { id: ctx.message.from.id } }).catch(console.log)
    await ctx.reply(i18n.t(ctx.user.language, 'message:userDeleted'), keyboards.empty)
    await ctx.scene.leave()
})

export default new Scenes.WizardScene<Context>(
    'deleteUser',
    async (ctx) => {
        if (!ctx.user) return await ctx.scene.leave()
        await ctx.reply(i18n.t(ctx.user.language, 'message:deleteUser'), keyboards.deleteUser(ctx.user.language))
        return ctx.wizard.next()
    },
    deleteHandler,
    confirmPasswordHandler,
)
