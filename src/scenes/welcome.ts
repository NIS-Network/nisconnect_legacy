import { Composer, Scenes } from 'telegraf'
import { message, callbackQuery } from 'telegraf/filters'
import { Context } from '../'
import i18n from '../utils/i18n'
import keyboards, { languagesList } from '../keyboards'
import login from '../utils/smsLogin'
import prisma from '../utils/prisma'
import bigIntStringify from '../utils/bigIntStringify'

const cancel = async (ctx: Context, next: () => Promise<void>) => {
    if (ctx.has(message('text'))) {
        // @ts-expect-error unsolved telegraf issue
        if (ctx.message.text == i18n.t(ctx.scene.state.language, 'button:cancel') || ctx.message.text == '/cancel') {
            // @ts-expect-error unsolved telegraf issue
            await ctx.reply(i18n.t(ctx.scene.state.language, 'welcome:canceled'))
            return await ctx.scene.leave()
        }
    }
    return next()
}

const languageHandler = new Composer<Context>()
languageHandler.on(message('text'), async (ctx) => {
    const language = ctx.message.text
    for (const i in languagesList) {
        if (languagesList[i] == language) {
            // @ts-expect-error unsolved telegraf issue
            ctx.scene.state.language = i
            break
        }
    }
    // @ts-expect-error unsolved telegraf issue
    if (!ctx.scene.state.language) return await ctx.reply(i18n.t('message:language'), keyboards.languages)
    // @ts-expect-error unsolved telegraf issue
    await ctx.reply(i18n.t(ctx.scene.state.language, 'welcome:greeting'), keyboards.start(ctx.scene.state.language))
    return ctx.wizard.next()
})
languageHandler.use(async (ctx) => await ctx.reply(i18n.t('message:language'), keyboards.languages))

const startHandler = new Composer<Context>()
startHandler.use(cancel)
startHandler.on(message('text'), async (ctx) => {
    // @ts-expect-error unsolved telegraf issue
    if (ctx.message.text == i18n.t(ctx.scene.state.language, 'welcome:start')) {
        // @ts-expect-error unsolved telegraf issue
        await ctx.reply(i18n.t(ctx.scene.state.language, 'welcome:disclaimer'), keyboards.ok(ctx.scene.state.language))
        return ctx.wizard.next()
    }
})
startHandler.use()

const loginHandler = new Composer<Context>()
loginHandler.use(cancel)
loginHandler.on(message('text'), async (ctx) => {
    const login = ctx.message.text
    // @ts-expect-error unsolved telegraf issue
    if (!Number(login) || login.length != 12) return await ctx.reply(i18n.t(ctx.scene.state.language, 'registration:login'), keyboards.empty)
    if (await prisma.user.findUnique({ where: { login: login } })) {
        // @ts-expect-error unsolved telegraf issue
        return await ctx.reply(i18n.t(ctx.scene.state.language, 'registration:exists'))
    }
    // @ts-expect-error unsolved telegraf issue
    ctx.scene.state.login = login
    // @ts-expect-error unsolved telegraf issue
    await ctx.reply(i18n.t(ctx.scene.state.language, 'registration:password'))
    return ctx.wizard.next()
})
// @ts-expect-error unsolved telegraf issue
loginHandler.use(async (ctx) => await ctx.reply(i18n.t(ctx.scene.state.language, 'registration:login'), keyboards.empty))

const passwordHandler = new Composer<Context>()
passwordHandler.use(cancel)
passwordHandler.on(message('text'), async (ctx) => {
    // @ts-expect-error unsolved telegraf issue
    ctx.scene.state.password = ctx.message.text
    // @ts-expect-error unsolved telegraf issue
    await ctx.reply(i18n.t(ctx.scene.state.language, 'registration:city'), keyboards.city(ctx.scene.state.language))
    return ctx.wizard.next()
})
passwordHandler.use()

const cityHandler = new Composer<Context>()
cityHandler.use(cancel)
cityHandler.on(callbackQuery('data'), async (ctx) => {
    const city = ctx.callbackQuery.data
    // @ts-expect-error unsolved telegraf issue
    ctx.scene.state.city = city
    // @ts-expect-error unsolved telegraf issue
    const authorized = await login(ctx.scene.state.login, ctx.scene.state.password, ctx.scene.state.city)
    if (!authorized) {
        // @ts-expect-error unsolved telegraf issue
        await ctx.reply(i18n.t(ctx.scene.state.language, 'registration:failed'))
        return await ctx.scene.leave()
    }
    // @ts-expect-error unsolved telegraf issue
    await ctx.reply(i18n.t(ctx.scene.state.language, 'registration:success'))

    return ctx.wizard.next()
})
cityHandler.use(async (ctx) => {
    return await ctx.deleteMessage()
})

const ageHandler = new Composer<Context>()
ageHandler.use(cancel)
ageHandler.on(message('text'), async (ctx) => {
    const age = Number(ctx.message.text)
    // @ts-expect-error unsolved telegraf issue
    if (!age || isNaN(age)) return await ctx.reply(i18n.t(ctx.scene.state.language, 'registration:age'), keyboards.empty)
    // @ts-expect-error unsolved telegraf issue
    ctx.scene.state.age = age
    // @ts-expect-error unsolved telegraf issue
    await ctx.reply(i18n.t(ctx.scene.state.language, 'registration:gender'), keyboards.gender(ctx.scene.state.language))
    return ctx.wizard.next()
})
// @ts-expect-error unsolved telegraf issue
ageHandler.use(async (ctx) => await ctx.reply(i18n.t(ctx.scene.state.language, 'registration:age'), keyboards.empty))

const genderHandler = new Composer<Context>()
genderHandler.use(cancel)
genderHandler.on(message('text'), async (ctx) => {
    const gender = ctx.message.text
    // @ts-expect-error unsolved telegraf issue
    if (gender == i18n.t(ctx.scene.state.language, 'gender:male')) {
        // @ts-expect-error unsolved telegraf issue
        ctx.scene.state.gender = 'male'
        // @ts-expect-error unsolved telegraf issue
    } else if (gender == i18n.t(ctx.scene.state.language, 'gender:female')) {
        // @ts-expect-error unsolved telegraf issue
        ctx.scene.state.gender = 'female'
    } else {
        // @ts-expect-error unsolved telegraf issue
        return await ctx.reply(i18n.t(ctx.scene.state.language, 'registration:gender'), keyboards.gender(ctx.scene.state.language))
    }
    // @ts-expect-error unsolved telegraf issue
    await ctx.reply(i18n.t(ctx.scene.state.language, 'registration:genderPreference'), keyboards.interest(ctx.scene.state.language))
    return ctx.wizard.next()
})
// @ts-expect-error unsolved telegraf issue
genderHandler.use(async (ctx) => await ctx.reply(i18n.t(ctx.scene.state.language, 'registration:gender'), keyboards.gender(ctx.scene.state.language)))

const genderPreferenceHandler = new Composer<Context>()
genderPreferenceHandler.use(cancel)
genderPreferenceHandler.on(message('text'), async (ctx) => {
    const genderPreference = ctx.message.text
    // @ts-expect-error unsolved telegraf issue
    if (genderPreference == i18n.t(ctx.scene.state.language, 'genderPreference:male')) {
        // @ts-expect-error unsolved telegraf issue
        ctx.scene.state.genderPreference = 'male'
        // @ts-expect-error unsolved telegraf issue
    } else if (genderPreference == i18n.t(ctx.scene.state.language, 'genderPreference:female')) {
        // @ts-expect-error unsolved telegraf issue
        ctx.scene.state.genderPreference = 'female'
        // @ts-expect-error unsolved telegraf issue
    } else if (genderPreference == i18n.t(ctx.scene.state.language, 'genderPreference:all')) {
        // @ts-expect-error unsolved telegraf issue
        ctx.scene.state.genderPreference = 'all'
    } else {
        // @ts-expect-error unsolved telegraf issue
        return await ctx.reply(i18n.t(ctx.scene.state.language, 'registration:genderPreference'), keyboards.interest(ctx.scene.state.language))
    }
    // @ts-expect-error unsolved telegraf issue
    await ctx.reply(i18n.t(ctx.scene.state.language, 'registration:name'), keyboards.empty)
    return ctx.wizard.next()
})
// @ts-expect-error unsolved telegraf issue
genderPreferenceHandler.use(async (ctx) => await ctx.reply(i18n.t(ctx.scene.state.language, 'registration:genderPreference'), keyboards.interest(ctx.scene.state.language)))

const nameHandler = new Composer<Context>()
nameHandler.use(cancel)
nameHandler.on(message('text'), async (ctx) => {
    // @ts-expect-error unsolved telegraf issue
    ctx.scene.state.name = ctx.message.text
    // @ts-expect-error unsolved telegraf issue
    await ctx.reply(i18n.t(ctx.scene.state.language, 'registration:bio'))
    return ctx.wizard.next()
})
// @ts-expect-error unsolved telegraf issue
nameHandler.use(async (ctx) => await ctx.reply(i18n.t(ctx.scene.state.language, 'registration:name')))

const bioHandler = new Composer<Context>()
bioHandler.use(cancel)
bioHandler.on(message('text'), async (ctx) => {
    // @ts-expect-error unsolved telegraf issue
    ctx.scene.state.bio = ctx.message.text
    // @ts-expect-error unsolved telegraf issue
    await ctx.reply(i18n.t(ctx.scene.state.language, 'registration:photo'))
    return ctx.wizard.next()
})
// @ts-expect-error unsolved telegraf issue
bioHandler.use(async (ctx) => await ctx.reply(ctx.scene.state.language, 'registration:photo'))

const photoHandler = new Composer<Context>()
photoHandler.use(cancel)
photoHandler.on(message('photo'), async (ctx) => {
    // @ts-expect-error unsolved telegraf issue
    ctx.scene.state.photoId = ctx.message.photo[ctx.message.photo.length - 1].file_id
    // @ts-expect-error unsolved telegraf issue
    await ctx.reply(i18n.t(ctx.scene.state.language, 'registration:profile'))
    // @ts-expect-error unsolved telegraf issue
    await ctx.sendPhoto(ctx.scene.state.photoId, {
        // @ts-expect-error unsolved telegraf issue
        caption: i18n.t(ctx.scene.state.language, 'message:profile', { name: ctx.scene.state.name, age: ctx.scene.state.age, bio: ctx.scene.state.bio }),
        // @ts-expect-error unsolved telegraf issue
        reply_markup: keyboards.main(ctx.scene.state.language).reply_markup,
    })
    ctx.session.user = await prisma.user.create({
        // @ts-expect-error unsolved telegraf issue
        // eslint-disable-next-line
        // prettier-ignore
        data: { id: ctx.message.from.id, city: ctx.scene.state.city, login: ctx.scene.state.login, language: ctx.scene.state.language, },
    })
    ctx.session.profile = await prisma.profile.create({
        // @ts-expect-error unsolved telegraf issue
        // eslint-disable-next-line
        // prettier-ignore
        data: { age: ctx.scene.state.age, bio: ctx.scene.state.bio, gender: ctx.scene.state.gender, name: ctx.scene.state.name, genderPreference: ctx.scene.state.genderPreference, photoId: ctx.scene.state.photoId, userId: ctx.message.from.id },
    })
    ctx.session.authorized = true
    await ctx.telegram.sendMessage(6033264583, `new user: ${bigIntStringify(ctx.session.user)}`)
    return await ctx.scene.leave()
})
photoHandler.use(async (ctx) => {
    return await ctx.deleteMessage()
})

export default new Scenes.WizardScene<Context>(
    'welcome',
    async (ctx) => {
        await ctx.reply(i18n.t('message:language'), keyboards.languages)
        return ctx.wizard.next()
    },
    languageHandler,
    startHandler,
    async (ctx) => {
        // @ts-expect-error unsolved telegraf issue
        if (ctx.has(message('text')) && ctx.message.text == i18n.t(ctx.scene.state.language, 'button:ok')) {
            // @ts-expect-error unsolved telegraf issue
            await ctx.reply(i18n.t(ctx.scene.state.language, 'registration:login'), keyboards.empty)
            return ctx.wizard.next()
        }
    },
    loginHandler,
    passwordHandler,
    cityHandler,
    ageHandler,
    genderHandler,
    genderPreferenceHandler,
    nameHandler,
    bioHandler,
    photoHandler,
)
