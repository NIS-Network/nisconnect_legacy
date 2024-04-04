import { callbackQuery } from 'telegraf/filters'
import { Context } from '..'
import prisma from '../utils/prisma'
import { Report, ReportType, User } from '@prisma/client'
import keyboards from '../keyboards'
import i18n from '../utils/i18n'

export interface ReportDTO {
    victim: Report['victim']
    intruder: Report['intruder']
    type: Report['type']
    message: Report['message']
}

export default async (ctx: Context) => {
    if (!ctx.has(callbackQuery('data'))) return
    const args = ctx.callbackQuery.data.split('_')
    const victim = await prisma.profile.findUnique({ where: { id: Number(args[1]) } })
    const intruder = await prisma.profile.findUnique({ where: { id: Number(args[2]) } })
    if (!victim || !intruder) return
    const report = await prisma.report.create({ data: { victim: victim.id, intruder: intruder.id, type: args[3] as ReportType, message: args[4] } })
    await ctx.reply(i18n.t(ctx.session.user.language, 'message:reported'), { reply_to_message_id: ctx.callbackQuery.message?.message_id })
    const admins: User[] = await prisma.user.findMany({ where: { role: { in: ['admin', 'superadmin'] } } })
    for (const admin of admins) {
        await ctx.telegram.sendMessage(
            Number(admin.id),
            `
New report!

Type: ${report.type}
${report.message ? `Message: ${report.message}` : ''}

Victim:
ID: ${victim.userId}
Name: ${victim.name}
Gender: ${victim.gender}
Gnender preference: ${victim.genderPreference}
Age: ${victim.age}

Intruder:
ID: ${intruder.userId}
Name: ${intruder.name}
Gender: ${intruder.gender}
Gender preference: ${intruder.genderPreference}
Age: ${intruder.age}
`.trim(),
            { reply_markup: keyboards.reportAction(report).reply_markup },
        )
    }
}
