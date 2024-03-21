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
bot.use(middlewares.handleLiked)

bot.start(handlers.start)
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
bot.action('deleteUser', handlers.authorizedOnly, async (ctx) => await ctx.scene.enter('deleteUser'))
bot.action(/respond_\w+/, handlers.authorizedOnly, handlers.response)

bot.on(message('photo'), async (ctx) => {
    if (ctx.session.user.status == 'chatting' && ctx.session.user.partner) {
        await ctx.telegram.sendPhoto(Number(ctx.session.user.partner), ctx.message.photo[ctx.message.photo.length - 1].file_id, { caption: ctx.message.caption })
    }
})
bot.on(message('audio'), async (ctx) => {
    if (ctx.session.user.status == 'chatting' && ctx.session.user.partner) {
        await ctx.telegram.sendAudio(Number(ctx.session.user.partner), ctx.message.audio.file_id, { caption: ctx.message.caption })
    }
})
bot.on(message('voice'), async (ctx) => {
    if (ctx.session.user.status == 'chatting' && ctx.session.user.partner) {
        await ctx.telegram.sendVoice(Number(ctx.session.user.partner), ctx.message.voice.file_id, { caption: ctx.message.caption })
    }
})
bot.on(message('text'), async (ctx) => {
    if (ctx.session.user.status == 'chatting' && ctx.session.user.partner) {
        await ctx.telegram.sendMessage(Number(ctx.session.user.partner), ctx.message.text)
    }
})
bot.on(message('sticker'), async (ctx) => {
    if (ctx.session.user.status == 'chatting' && ctx.session.user.partner) {
        await ctx.telegram.sendSticker(Number(ctx.session.user.partner), ctx.message.sticker.file_id)
    }
})
bot.on(message('video'), async (ctx) => {
    if (ctx.session.user.status == 'chatting' && ctx.session.user.partner) {
        await ctx.telegram.sendVideo(Number(ctx.session.user.partner), ctx.message.video.file_id, { caption: ctx.message.caption })
    }
})
bot.on(message('video_note'), async (ctx) => {
    if (ctx.session.user.status == 'chatting' && ctx.session.user.partner) {
        await ctx.telegram.sendVideoNote(Number(ctx.session.user.partner), ctx.message.video_note.file_id)
    }
})

bot.catch((err, ctx) => {
    console.error(err)
    console.log(ctx)
})
bot.launch()
