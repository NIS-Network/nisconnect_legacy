import './locales/en.json'
import './locales/kz.json'
import './locales/ru.json'

import { Scenes, session, Telegraf, Context as TelegrafContext } from 'telegraf'
import scenes from './scenes'
import handlers from './handlers'
import { Profile, User } from '@prisma/client'
import i18n from './utils/i18n'
import { message } from 'telegraf/filters'
import usersOnly from './handlers/authorizedOnly'
import { Update } from 'telegraf/types'
import middlewares from './middlewares'
import { viewProfilesState } from './scenes/viewProfiles'
import authorizedOnly from './handlers/authorizedOnly'

interface Session extends Scenes.WizardSession {
    user: User
    profile: Profile
    authorized: true | undefined
    viewProfilesState: viewProfilesState
}

export interface Context<U extends Update = Update> extends TelegrafContext<U> {
    scene: Scenes.SceneContextScene<Context, Scenes.WizardSessionData>
    wizard: Scenes.WizardContextWizard<Context>
    session: Session
}

const bot = new Telegraf<Context>(process.env.BOT_TOKEN || '')
const stage = new Scenes.Stage<Context>(Object.values(scenes))
bot.use(session())
bot.use(stage.middleware())
bot.use(middlewares.checkAuth)
bot.use(async (ctx, next) => {
    if (ctx?.session?.user?.banned) return await ctx.reply('you are banned')
    return next()
})
bot.use(middlewares.handleLiked)

bot.start(handlers.start)

bot.command('admin', handlers.authorizedOnly, handlers.adminsOnly, async (ctx) => await ctx.scene.enter('admin'))

bot.hears(
    i18n.localesList.map((locale) => i18n.t(locale, 'button:profile')),
    handlers.authorizedOnly,
    handlers.profile,
)
bot.hears(
    i18n.localesList.map((locale) => i18n.t(locale, 'button:settings')),
    handlers.authorizedOnly,
    handlers.settings,
)
bot.hears(
    i18n.localesList.map((locale) => i18n.t(locale, 'button:searchPartner')),
    handlers.authorizedOnly,
    handlers.searchPartner,
)
bot.hears(
    i18n.localesList.map((locale) => i18n.t(locale, 'button:leavePartner')),
    handlers.authorizedOnly,
    handlers.leavePartner,
)
bot.hears(
    i18n.localesList.map((locale) => i18n.t(locale, 'button:stopSearching')),
    usersOnly,
    handlers.stopSearching,
)
bot.hears(
    i18n.localesList.map((locale) => i18n.t(locale, 'button:viewProfiles')),
    usersOnly,
    handlers.viewProfiles,
)
bot.action('changeLanguage', handlers.authorizedOnly, async (ctx) => await ctx.scene.enter('changeLanguage'))
bot.action('changeProfile', handlers.authorizedOnly, async (ctx) => await ctx.scene.enter('changeProfile'))
bot.action('deleteUser', handlers.authorizedOnly, async (ctx) => await ctx.scene.enter('deleteUser'))
bot.action(/respond_\w+/, handlers.authorizedOnly, handlers.response)
bot.action(/report_\w+_\w+/, handlers.authorizedOnly, handlers.report)

bot.action(/ban_\w+/, handlers.authorizedOnly, handlers.adminsOnly, handlers.ban)
bot.action(/warn_\w+/, handlers.authorizedOnly, handlers.adminsOnly, handlers.warn)

bot.on(message('photo'), authorizedOnly, async (ctx) => {
    if (ctx.session.user.status == 'chatting' && ctx.session.user.partner) {
        await ctx.telegram.sendPhoto(Number(ctx.session.user.partner), ctx.message.photo[ctx.message.photo.length - 1].file_id, { caption: ctx.message.caption })
    }
})
bot.on(message('audio'), authorizedOnly, async (ctx) => {
    if (ctx.session.user.status == 'chatting' && ctx.session.user.partner) {
        await ctx.telegram.sendAudio(Number(ctx.session.user.partner), ctx.message.audio.file_id, { caption: ctx.message.caption })
    }
})
bot.on(message('voice'), authorizedOnly, async (ctx) => {
    if (ctx.session.user.status == 'chatting' && ctx.session.user.partner) {
        await ctx.telegram.sendVoice(Number(ctx.session.user.partner), ctx.message.voice.file_id, { caption: ctx.message.caption })
    }
})
bot.on(message('text'), authorizedOnly, async (ctx) => {
    if (ctx.session.user.status == 'chatting' && ctx.session.user.partner) {
        await ctx.telegram.sendMessage(Number(ctx.session.user.partner), ctx.message.text)
    }
})
bot.on(message('sticker'), authorizedOnly, async (ctx) => {
    if (ctx.session.user.status == 'chatting' && ctx.session.user.partner) {
        await ctx.telegram.sendSticker(Number(ctx.session.user.partner), ctx.message.sticker.file_id)
    }
})
bot.on(message('video'), authorizedOnly, async (ctx) => {
    if (ctx.session.user.status == 'chatting' && ctx.session.user.partner) {
        await ctx.telegram.sendVideo(Number(ctx.session.user.partner), ctx.message.video.file_id, { caption: ctx.message.caption })
    }
})
bot.on(message('video_note'), authorizedOnly, async (ctx) => {
    if (ctx.session.user.status == 'chatting' && ctx.session.user.partner) {
        await ctx.telegram.sendVideoNote(Number(ctx.session.user.partner), ctx.message.video_note.file_id)
    }
})

bot.catch(async (err, ctx) => {
    try {
        await ctx.reply('ERROR, @NISConnectChat -> опишите')
        console.error(err)
        console.log(ctx, ctx.from)
    } catch {
        //
    }
})

bot.launch({ dropPendingUpdates: true })
