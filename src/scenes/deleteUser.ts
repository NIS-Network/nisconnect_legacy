import { Composer, Scenes } from 'telegraf'
import { Context } from '..'
import i18n from '../utils/i18n'
import { message } from 'telegraf/filters'
import keyboards from '../keyboards'
import login from '../utils/smsLogin'
import prisma from '../utils/prisma'

const cancel = async (ctx: Context, next: () => Promise<void>) => {
    if (ctx.has(message('text'))) {
        if (ctx.message.text == i18n.t(ctx.session.user.language, 'button:cancel') || ctx.message.text == '/cancel') {
            await ctx.reply(i18n.t(ctx.session.user.language, 'message:canceled'), keyboards.main(ctx.session.user.language, ctx.session.user.status))
            return await ctx.scene.leave()
        }
    }
    return next()
}

const deleteHandler = new Composer<Context>()
deleteHandler.use(cancel)
deleteHandler.on(message('text'), async (ctx) => {
    if (!ctx.session.user) return await ctx.scene.leave()
    if (ctx.message.text != i18n.t(ctx.session.user.language, 'button:deleteUserAnyway')) {
        return await ctx.reply(i18n.t(ctx.session.user.language, 'message:deleteUser'), keyboards.deleteUser(ctx.session.user.language))
    }
    await ctx.reply(i18n.t(ctx.session.user.language, 'message:confirmPassword', { id: ctx.session.user.login }), keyboards.cancel(ctx.session.user.language))
    return ctx.wizard.next()
})

const confirmPasswordHandler = new Composer<Context>()
confirmPasswordHandler.use(cancel)
confirmPasswordHandler.on(message('text'), async (ctx) => {
    const password = ctx.message.text
    const authorized = await login(ctx.session.user.login, password, ctx.session.user.city)
    if (!authorized) {
        await ctx.reply(i18n.t(ctx.session.user.language, 'message:wrongPassword'), keyboards.main(ctx.session.user.language))
        return await ctx.scene.leave()
    }
    await prisma.profile.delete({ where: { userId: ctx.session.user.id } })
    await prisma.user.delete({ where: { id: ctx.session.user.id } })
    ctx.session.authorized = undefined
    await ctx.reply(i18n.t(ctx.session.user.language, 'message:userDeleted'), keyboards.empty)
    await ctx.scene.leave()
})

export default new Scenes.WizardScene<Context>(
    'deleteUser',
    async (ctx) => {
        await ctx.reply(i18n.t(ctx.session.user.language, 'message:deleteUser'), keyboards.deleteUser(ctx.session.user.language))
        return ctx.wizard.next()
    },
    deleteHandler,
    confirmPasswordHandler,
)
