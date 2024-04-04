import { Composer, Scenes } from 'telegraf'
import { Context } from '..'
import i18n from '../utils/i18n'
import keyboards from '../keyboards'
import { message } from 'telegraf/filters'
import { combineKeyboards } from '../utils/combineKeyboards'
import prisma from '../utils/prisma'

const ageHandler = new Composer<Context>()
ageHandler.on(message('text'), async (ctx) => {
    const age = Number(ctx.message.text)
    if (!age) return await ctx.reply(i18n.t(ctx.session.user.language, 'registration:age'), keyboards.oneButton(ctx.session.profile.age.toString()))
    // @ts-expect-error unsolved telegraf issue
    ctx.scene.state.age = age
    await ctx.reply(i18n.t(ctx.session.user.language, 'registration:gender'), keyboards.gender(ctx.session.user.language))
    return ctx.wizard.next()
})

const genderHandler = new Composer<Context>()
genderHandler.on(message('text'), async (ctx) => {
    const gender = ctx.message.text
    if (gender == i18n.t(ctx.session.user.language, 'gender:male')) {
        // @ts-expect-error unsolved telegraf issue
        ctx.scene.state.gender = 'male'
    } else if (gender == i18n.t(ctx.session.user.language, 'gender:female')) {
        // @ts-expect-error unsolved telegraf issue
        ctx.scene.state.gender = 'female'
    } else {
        return await ctx.reply(i18n.t(ctx.session.user.language, 'registration:gender'), keyboards.gender(ctx.session.user.language))
    }
    await ctx.reply(i18n.t(ctx.session.user.language, 'registration:genderPreference'), keyboards.interest(ctx.session.user.language))
    return ctx.wizard.next()
})

const genderPreferenceHandler = new Composer<Context>()
genderPreferenceHandler.on(message('text'), async (ctx) => {
    const genderPreference = ctx.message.text
    if (genderPreference == i18n.t(ctx.session.user.language, 'genderPreference:male')) {
        // @ts-expect-error unsolved telegraf issue
        ctx.scene.state.genderPreference = 'male'
    } else if (genderPreference == i18n.t(ctx.session.user.language, 'genderPreference:female')) {
        // @ts-expect-error unsolved telegraf issue
        ctx.scene.state.genderPreference = 'female'
    } else if (genderPreference == i18n.t(ctx.session.user.language, 'genderPreference:all')) {
        // @ts-expect-error unsolved telegraf issue
        ctx.scene.state.genderPreference = 'all'
    } else {
        return await ctx.reply(i18n.t(ctx.session.user.language, 'registration:genderPreference'), keyboards.interest(ctx.session.user.language))
    }
    await ctx.reply(i18n.t(ctx.session.user.language, 'registration:name'), keyboards.oneButton(ctx.session.profile.name))
    return ctx.wizard.next()
})

const nameHandler = new Composer<Context>()
nameHandler.on(message('text'), async (ctx) => {
    // @ts-expect-error unsolved telegraf issue
    ctx.scene.state.name = ctx.message.text
    await ctx.reply(i18n.t(ctx.session.user.language, 'registration:bio'), keyboards.oneButton(i18n.t(ctx.session.user.language, 'button:leaveCurrent')))
    return ctx.wizard.next()
})

const bioHandler = new Composer<Context>()
bioHandler.on(message('text'), async (ctx) => {
    if (ctx.message.text == i18n.t(ctx.session.user.language, 'button:leaveCurrent')) {
        // @ts-expect-error unsolved telegraf issue
        ctx.scene.state.bio = ctx.session.profile.bio
    } else {
        // @ts-expect-error unsolved telegraf issue
        ctx.scene.state.bio = ctx.message.text
    }
    await ctx.reply(i18n.t(ctx.session.user.language, 'registration:photo'), keyboards.oneButton(i18n.t(ctx.session.user.language, 'button:leaveCurrent')))
    return ctx.wizard.next()
})

const photoHandler = new Composer<Context>()
photoHandler.on(message('text'), async (ctx, next) => {
    if (ctx.message.text == i18n.t(ctx.session.user.language, 'button:leaveCurrent')) {
        // @ts-expect-error unsolved telegraf issue
        ctx.scene.state.photoId = ctx.session.profile.photoId
        await ctx.reply(i18n.t(ctx.session.user.language, 'registration:profile'))
        // @ts-expect-error unsolved telegraf issue
        await ctx.sendPhoto(ctx.scene.state.photoId, {
            // @ts-expect-error unsolved telegraf issue
            caption: i18n.t(ctx.session.user.language, 'message:profile', { name: ctx.scene.state.name, age: ctx.scene.state.age, bio: ctx.scene.state.bio }),
            reply_markup: keyboards.main(ctx.session.user.language, ctx.session.user.status).reply_markup,
        })
        await ctx.reply(
            i18n.t(ctx.session.user.language, 'message:isOK'),
            combineKeyboards(keyboards.ok(ctx.session.user.language), keyboards.oneButton(i18n.t(ctx.session.user.language, 'button:changeProfile'))),
        )
        return ctx.wizard.next()
    }
    return next()
})
photoHandler.on(message('photo'), async (ctx) => {
    // @ts-expect-error unsolved telegraf issue
    ctx.scene.state.photoId = ctx.message.photo[ctx.message.photo.length - 1].file_id
    await ctx.reply(i18n.t(ctx.session.user.language, 'registration:profile'))
    // @ts-expect-error unsolved telegraf issue
    await ctx.sendPhoto(ctx.scene.state.photoId, {
        // @ts-expect-error unsolved telegraf issue
        caption: i18n.t(ctx.session.user.language, 'message:profile', { name: ctx.scene.state.name, age: ctx.scene.state.age, bio: ctx.scene.state.bio }),
        reply_markup: keyboards.main(ctx.session.user.language, ctx.session.user.status).reply_markup,
    })
    await ctx.reply(
        i18n.t(ctx.session.user.language, 'message:isOK'),
        combineKeyboards(keyboards.ok(ctx.session.user.language), keyboards.oneButton(i18n.t(ctx.session.user.language, 'button:changeProfile'))),
    )
    return ctx.wizard.next()
})
photoHandler.use(async (ctx) => {
    return await ctx.deleteMessage()
})

const approvalHandler = new Composer<Context>()
approvalHandler.on(message('text'), async (ctx) => {
    if (ctx.message.text == i18n.t(ctx.session.user.language, 'button:ok')) {
        await prisma.profile.update({
            where: { id: ctx.session.profile.id },
            // @ts-expect-error unsolved telegraf issue
            // eslint-disable-next-line
            // prettier-ignore
            data: { gender: ctx.scene.state.gender, genderPreference: ctx.scene.state.genderPreference, name: ctx.scene.state.name, age: ctx.scene.state.age, bio: ctx.scene.state.bio, photoId: ctx.scene.state.photoId },
        })
        await ctx.reply(i18n.t(ctx.session.user.language, 'message:saved'), keyboards.main(ctx.session.user.language, ctx.session.user.status))
        return await ctx.scene.leave()
    } else if (ctx.message.text == i18n.t(ctx.session.user.language, 'button:changeProfile')) {
        return await ctx.scene.reenter()
    } else {
        return await ctx.reply(
            i18n.t(ctx.session.user.language, 'message:isOK'),
            combineKeyboards(keyboards.ok(ctx.session.user.language), keyboards.oneButton(i18n.t(ctx.session.user.language, 'button:changeProfile'))),
        )
    }
})

export default new Scenes.WizardScene<Context>(
    'changeProfile',
    async (ctx) => {
        await ctx.reply(i18n.t(ctx.session.user.language, 'registration:age'), keyboards.oneButton(ctx.session.profile.age.toString()))
        return ctx.wizard.next()
    },
    ageHandler,
    genderHandler,
    genderPreferenceHandler,
    nameHandler,
    bioHandler,
    photoHandler,
    approvalHandler,
)
