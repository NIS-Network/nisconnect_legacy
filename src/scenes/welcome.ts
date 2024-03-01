import { Composer, Scenes } from 'telegraf'
import { message, callbackQuery } from 'telegraf/filters'
import { Context } from '../'
import { i18n } from '../utils/i18n'
import keyboards, { languagesList } from '../keyboards'
import login from '../utils/smsLogin'
import prisma from '../utils/prisma'

const cancel = async (ctx: Context, next: () => Promise<void>) => {
    // @ts-expect-error unsolved telegraf issue
    if ((ctx.has(message('text')) && ctx.message.text == i18n.t(ctx.scene.state.language, 'cancel')) || ctx.message.text == '/cancel') {
        await ctx.reply(i18n.t('welcomeCanceled'))
        return await ctx.scene.leave()
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
    if (!ctx.scene.state.language) return await ctx.reply(i18n.t('selectLanguage'), keyboards.languages)
    // @ts-expect-error unsolved telegraf issue
    await ctx.reply(i18n.t(ctx.scene.state.language, 'welcomeGreeting'), keyboards.start(ctx.scene.state.language))
    return ctx.wizard.next()
})

const startHandler = new Composer<Context>()
startHandler.use(cancel)
startHandler.on(message('text'), async (ctx) => {
    // @ts-expect-error unsolved telegraf issue
    if (ctx.message.text == i18n.t(ctx.scene.state.language, 'welcomeStart')) {
        // @ts-expect-error unsolved telegraf issue
        await ctx.reply(i18n.t(ctx.scene.state.language, 'welcomeDisclaimer'), keyboards.ok(ctx.scene.state.language))
        return ctx.wizard.next()
    }
})

const loginHandler = new Composer<Context>()
loginHandler.use(cancel)
loginHandler.on(message('text'), async (ctx) => {
    const login = ctx.message.text
    // @ts-expect-error unsolved telegraf issue
    if (!Number(login) || login.length != 12) return await ctx.reply(i18n.t(ctx.scene.state.language, 'enterLogin'), keyboards.empty)
    if (await prisma.user.findUnique({ where: { login: login } })) {
        // @ts-expect-error unsolved telegraf issue
        return await ctx.reply(i18n.t(ctx.scene.state.language, 'alreadyExists'))
    }
    // @ts-expect-error unsolved telegraf issue
    ctx.scene.state.login = login
    // @ts-expect-error unsolved telegraf issue
    await ctx.reply(i18n.t(ctx.scene.state.language, 'enterPassword'))
    return ctx.wizard.next()
})

const passwordHandler = new Composer<Context>()
passwordHandler.use(cancel)
passwordHandler.on(message('text'), async (ctx) => {
    // @ts-expect-error unsolved telegraf issue
    ctx.scene.state.password = ctx.message.text
    // @ts-expect-error unsolved telegraf issue
    await ctx.reply(i18n.t(ctx.scene.state.language, 'selectCity'), keyboards.city(ctx.scene.state.language))
    return ctx.wizard.next()
})

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
        await ctx.reply(i18n.t(ctx.scene.state.language, 'authFailed'))
        return await ctx.scene.leave()
    }
    // @ts-expect-error unsolved telegraf issue
    await ctx.telegram.editMessageText(ctx.callbackQuery.message?.chat.id, ctx.callbackQuery.message?.message_id, ctx.callbackQuery.inline_message_id, i18n.t(ctx.scene.state.language, 'authSuccess'))
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
    if (!age) return await ctx.reply(i18n.t(ctx.scene.state.language, 'enterAge'), keyboards.empty)
    // @ts-expect-error unsolved telegraf issue
    ctx.scene.state.age = age
    // @ts-expect-error unsolved telegraf issue
    await ctx.reply(i18n.t(ctx.scene.state.language, 'enterGender'), keyboards.gender(ctx.scene.state.language))
    return ctx.wizard.next()
})

const genderHandler = new Composer<Context>()
genderHandler.use(cancel)
genderHandler.on(message('text'), async (ctx) => {
    const gender = ctx.message.text
    // @ts-expect-error unsolved telegraf issue
    if (gender == i18n.t(ctx.scene.state.language, 'genderMale')) {
        // @ts-expect-error unsolved telegraf issue
        ctx.scene.state.gender = 'male'
        // @ts-expect-error unsolved telegraf issue
    } else if (gender == i18n.t(ctx.scene.state.language, 'genderFemale')) {
        // @ts-expect-error unsolved telegraf issue
        ctx.scene.state.gender == 'female'
    } else {
        // @ts-expect-error unsolved telegraf issue
        return await ctx.reply(i18n.t(ctx.scene.state.language, 'enterGender'), keyboards.gender(ctx.scene.state.language))
    }
    // @ts-expect-error unsolved telegraf issue
    await ctx.reply(i18n.t(ctx.scene.state.language, 'enterGenderPreference'), keyboards.interest(ctx.scene.state.language))
    return ctx.wizard.next()
})

const genderPreferenceHandler = new Composer<Context>()
genderPreferenceHandler.use(cancel)
genderPreferenceHandler.on(message('text'), async (ctx) => {
    const genderPreference = ctx.message.text
    // @ts-expect-error unsolved telegraf issue
    if (genderPreference == i18n.t(ctx.scene.state.language, 'genderPreferenceMale')) {
        // @ts-expect-error unsolved telegraf issue
        ctx.scene.state.genderPreference = 'male'
        // @ts-expect-error unsolved telegraf issue
    } else if (genderPreference == i18n.t(ctx.scene.state.language, 'genderPreferenceFemale')) {
        // @ts-expect-error unsolved telegraf issue
        ctx.scene.state.genderPreference = 'female'
        // @ts-expect-error unsolved telegraf issue
    } else if (genderPreference == i18n.t(ctx.scene.state.language, 'genderPreferenceAll')) {
        // @ts-expect-error unsolved telegraf issue
        ctx.scene.state.genderPreference = 'all'
    } else {
        // @ts-expect-error unsolved telegraf issue
        return await ctx.reply(i18n.t(ctx.scene.state.language, 'enterPreference'), keyboards.interest(ctx.scene.state.language))
    }
    // @ts-expect-error unsolved telegraf issue
    await ctx.reply(i18n.t(ctx.scene.state.language, 'enterName'), keyboards.empty)
    return ctx.wizard.next()
})

const nameHandler = new Composer<Context>()
nameHandler.use(cancel)
nameHandler.on(message('text'), async (ctx) => {
    // @ts-expect-error unsolved telegraf issue
    ctx.scene.state.name = ctx.message.text
    // @ts-expect-error unsolved telegraf issue
    await ctx.reply(i18n.t(ctx.scene.state.language, 'enterBio'))
    return ctx.wizard.next()
})

const bioHandler = new Composer<Context>()
bioHandler.use(cancel)
bioHandler.on(message('text'), async (ctx) => {
    // @ts-expect-error unsolved telegraf issue
    ctx.scene.state.bio = ctx.message.text
    // @ts-expect-error unsolved telegraf issue
    await ctx.reply(i18n.t(ctx.scene.state.language, 'sendPhoto'))
    return ctx.wizard.next()
})

const photoHandler = new Composer<Context>()
photoHandler.use(cancel)
photoHandler.on(message('photo'), async (ctx) => {
    // @ts-expect-error unsolved telegraf issue
    ctx.scene.state.photoId = ctx.message.photo[3].file_id
    // @ts-expect-error unsolved telegraf issue
    await ctx.reply(i18n.t(ctx.scene.state.language, 'thisIsYourProfile'))
    // @ts-expect-error unsolved telegraf issue
    await ctx.sendPhoto(ctx.scene.state.photoId, { caption: `${ctx.scene.state.name}, ${ctx.scene.state.age} - ${ctx.scene.state.bio}` })
    await prisma.user.create({
        data: {
            id: ctx.message.from.id,
            // @ts-expect-error unsolved telegraf issue
            city: ctx.scene.state.city,
            // @ts-expect-error unsolved telegraf issue
            login: ctx.scene.state.login,
            // @ts-expect-error unsolved telegraf issue
            language: ctx.scene.state.language,
            profile: {
                create: {
                    // @ts-expect-error unsolved telegraf issue
                    age: ctx.scene.state.age,
                    // @ts-expect-error unsolved telegraf issue
                    bio: ctx.scene.state.bio,
                    // @ts-expect-error unsolved telegraf issue
                    gender: ctx.scene.state.gender,
                    // @ts-expect-error unsolved telegraf issue
                    name: ctx.scene.state.name,
                    // @ts-expect-error unsolved telegraf issue
                    genderPreference: ctx.scene.state.genderPreference,
                    // @ts-expect-error unsolved telegraf issue
                    photoId: ctx.scene.state.photoId,
                },
            },
        },
    })
    return await ctx.scene.leave()
})
photoHandler.use(async (ctx) => {
    return await ctx.deleteMessage()
})

export default new Scenes.WizardScene<Context>(
    'welcome',
    async (ctx) => {
        await ctx.reply(i18n.t('selectLanguage'), keyboards.languages)
        return ctx.wizard.next()
    },
    languageHandler,
    startHandler,
    async (ctx) => {
        // @ts-expect-error unsolved telegraf issue
        if (ctx.has(message('text')) && ctx.message.text == i18n.t(ctx.scene.state.language, 'ok')) {
            // @ts-expect-error unsolved telegraf issue
            await ctx.reply(i18n.t(ctx.scene.state.language, 'enterLogin'), keyboards.empty)
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
