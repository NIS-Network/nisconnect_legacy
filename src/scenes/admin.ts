import { Scenes } from 'telegraf'
import { Context } from '..'
import keyboards from '../keyboards'
import prisma from '../utils/prisma'
import fs from 'fs'
import path from 'path'
import bigIntStringify from '../utils/bigIntStringify'

const panel = new Scenes.BaseScene<Context>('admin')

panel.enter(async (ctx) => {
    await ctx.reply('Admin panel:', keyboards.admin)
})

panel.hears('Metrics', async (ctx) => {
    const users = await prisma.user.count()
    const profiles = await prisma.profile.count()
    const queues = await prisma.queue.count()
    const admins = await prisma.user.count({ where: { role: { in: ['admin', 'superadmin'] } } })
    await ctx.reply(
        `
Total users: ${users}
Total profiles: ${profiles}
Total queues: ${queues}
Total admins: ${admins}
`.trim(),
    )
})

panel.hears('Database', async (ctx) => {
    const today = new Date()
    const date = `${today.getDay()}.${today.getMonth() + 1}.${today.getFullYear()}`
    const users = await prisma.user.findMany()
    const profiles = await prisma.profile.findMany()
    const dirPath = path.join(__dirname, '..', '..', 'backups', date)
    const usersPath = path.join(__dirname, '..', '..', 'backups', date, `users.json`)
    const profilesPath = path.join(__dirname, '..', '..', 'backups', date, `profiles.json`)
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath)
    }
    fs.writeFile(usersPath, bigIntStringify(users), () => {
        fs.writeFile(profilesPath, bigIntStringify(profiles), async () => {
            await ctx.replyWithDocument({ source: usersPath, filename: `users_${date}.json` }, { caption: `Users backup for ${date}` })
            await ctx.replyWithDocument({ source: profilesPath, filename: `profiles_${date}.json` }, { caption: `Profiles backup for ${date}` })
        })
    })
})

panel.hears('Change user', async (ctx) => {
    await ctx.reply('Enter /setUser <id> <key> <value>')
})
panel.hears('Change profile', async (ctx) => {
    await ctx.reply('Enter /setProfile <id> <key> <value>')
})
panel.hears('Change queue', async (ctx) => {
    await ctx.reply('Enter /setQueue <id> <key> <value>')
})

panel.command('setUser', async (ctx) => {
    const id = Number(ctx.message.text.split(' ')[1])
    const key = ctx.message.text.split(' ')[2]
    const value = ctx.message.text.split(' ')[3]
    await prisma.user.update({ where: { id }, data: { [key]: value } })
})
panel.command('setProfile', async (ctx) => {
    const id = Number(ctx.message.text.split(' ')[1])
    const key = ctx.message.text.split(' ')[2]
    const value = isNaN(Number(ctx.message.text.split(' ')[3])) ? ctx.message.text.split(' ')[3] : Number(ctx.message.text.split(' ')[3])
    await prisma.profile.update({ where: { id }, data: { [key]: value } })
})
panel.command('setQueue', async (ctx) => {
    const id = Number(ctx.message.text.split(' ')[1])
    const key = ctx.message.text.split(' ')[2]
    const value = ctx.message.text.split(' ')[3]
    await prisma.queue.update({ where: { id }, data: { [key]: value } })
})

panel.hears('Exit admin panel', async (ctx) => {
    await ctx.reply('Exited', keyboards.main(ctx.session.user.language, ctx.session.user.status))
    return await ctx.scene.leave()
})

export default panel
