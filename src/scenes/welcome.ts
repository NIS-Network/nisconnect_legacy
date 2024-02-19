import { Composer, Scenes } from 'telegraf'
import { Context } from '..'
import { message, callbackQuery } from 'telegraf/filters'
import keyboards from '../keyboards'
import login from '../utils/smsLogin'
import { userStatements } from '../database/user'
import { profileStatements } from '../database/profile'

const loginHandler = new Composer<Context>()
loginHandler.on(message('text'), async (ctx) => {
    const login: number = Number(ctx.message.text)
    if (!login) return await ctx.reply('Введи свой ИИН:', keyboards.empty)
    // @ts-expect-error unsolved telegraf issue
    ctx.scene.state.login = login
    await ctx.reply('Введи пароль для входа в СУШ:')
    return ctx.wizard.next()
})

const passwordHandler = new Composer<Context>()
passwordHandler.on(message('text'), async (ctx) => {
    // @ts-expect-error unsolved telegraf issue
    ctx.scene.state.password = ctx.message.text
    await ctx.reply('В какой школе ты учишься?', keyboards.city)
    return ctx.wizard.next()
})

const cityHandler = new Composer<Context>()
cityHandler.on(callbackQuery('data'), async (ctx) => {
    const city = ctx.callbackQuery.data
    // @ts-expect-error unsolved telegraf issue
    ctx.scene.state.city = city
    // @ts-expect-error unsolved telegraf issue
    const authorized = login(ctx.scene.state.id, ctx.scene.state.password, ctx.scene.state.city)
    if (!authorized) {
        await ctx.reply('Ваши данные невалидны, попробуйте снова, отправив команду /start')
        return await ctx.scene.leave()
    }
    await ctx.telegram.editMessageText(ctx.callbackQuery.message?.chat.id, ctx.callbackQuery.message?.message_id, ctx.callbackQuery.inline_message_id, `Вход выполнен, теперь заполним анкету\nСколько тебе лет?`)
    return ctx.wizard.next()
})
cityHandler.use(async (ctx) => {
    return await ctx.deleteMessage()
})

const ageHandler = new Composer<Context>()
ageHandler.on(message('text'), async (ctx) => {
    const age: number = Number(ctx.message.text)
    if (!age || age < 12) return await ctx.reply('Сколько тебе лет?', keyboards.empty)
    // @ts-expect-error unsolved telegraf issue
    ctx.scene.state.age = age
    await ctx.reply('Теперь определимся с полом', keyboards.gender)
    return ctx.wizard.next()
})

const genderHandler = new Composer<Context>()
genderHandler.on(message('text'), async (ctx) => {
    const gender = ctx.message.text
    if (gender == 'Я парень') {
        // @ts-expect-error unsolved telegraf issue
        ctx.scene.state.gender = 'male'
    } else if (gender == 'Я девушка') {
        // @ts-expect-error unsolved telegraf issue
        ctx.scene.state.gender == 'female'
    } else {
        return await ctx.reply('Теперь определимся с полом', keyboards.gender)
    }
    await ctx.reply('Кто тебе интересен?', keyboards.interest)
    return ctx.wizard.next()
})

const interestHandler = new Composer<Context>()
interestHandler.on(message('text'), async (ctx) => {
    const interest = ctx.message.text
    if (interest == 'Парни') {
        // @ts-expect-error unsolved telegraf issue
        ctx.scene.state.interest = 'male'
    } else if (interest == 'Девушки') {
        // @ts-expect-error unsolved telegraf issue
        ctx.scene.state.interest = 'female'
    } else if (interest == 'Все') {
        // @ts-expect-error unsolved telegraf issue
        ctx.scene.state.interest = 'all'
    } else {
        return await ctx.reply('Кто тебе интересен?', keyboards.interest)
    }
    await ctx.reply('Как мне тебя звать?', keyboards.empty)
    return ctx.wizard.next()
})

const nameHandler = new Composer<Context>()
nameHandler.on(message('text'), async (ctx) => {
    // @ts-expect-error unsolved telegraf issue
    ctx.scene.state.name = ctx.message.text
    await ctx.reply('Расскажи о себе и кого хочешь найти, чем предлагаешь заняться. Это поможет лучше подобрать тебе компанию.')
    return ctx.wizard.next()
})

const bioHandler = new Composer<Context>()
bioHandler.on(message('text'), async (ctx) => {
    // @ts-expect-error unsolved telegraf issue
    ctx.scene.state.bio = ctx.message.text
    await ctx.reply('Теперь пришли фото, его будут видеть другие пользователи')
    return ctx.wizard.next()
})

const photoHandler = new Composer<Context>()
photoHandler.on(message('photo'), async (ctx) => {
    // @ts-expect-error unsolved telegraf issue
    profileStatements.create.run({ id: ctx.message.from.id, age: Number(ctx.scene.state.age), bio: ctx.scene.state.bio, gender: ctx.scene.state.gender, interest: ctx.scene.state.interest, name: ctx.scene.state.name, photo: ctx.scene.state.photo })
    // @ts-expect-error unsolved telegraf issue
    userStatements.create.run({ id: ctx.message.from.id, login: ctx.scene.state.login, password: ctx.scene.state.password, registrationDate: Date.now(), city: ctx.scene.state.city, profile: ctx.message.from.id })
    // @ts-expect-error unsolved telegraf issue
    ctx.scene.state.photo = ctx.message.photo[3].file_id
    await ctx.reply('Так выглядит твоя анкета:')
    // @ts-expect-error unsolved telegraf issue
    await ctx.sendPhoto(ctx.scene.state.photo, { caption: `${ctx.scene.state.name}, ${ctx.scene.state.age} - ${ctx.scene.state.bio}\n\ngender: ${ctx.scene.state.gender}  interested in: ${ctx.scene.state.interest}` })
    return await ctx.scene.leave()
})
photoHandler.use(async (ctx) => {
    return await ctx.deleteMessage()
})

export default new Scenes.WizardScene<Context>(
    'welcome',
    async (ctx) => {
        await ctx.reply('Введи свой ИИН:', keyboards.empty)
        return ctx.wizard.next()
    },
    loginHandler,
    passwordHandler,
    cityHandler,
    ageHandler,
    genderHandler,
    interestHandler,
    nameHandler,
    bioHandler,
    photoHandler,
)
