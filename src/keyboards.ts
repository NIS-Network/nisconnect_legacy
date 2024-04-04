import { Markup } from 'telegraf'
import chunk from './utils/chunk'
import { City, Report, ReportType, Status } from '@prisma/client'
import i18n from './utils/i18n'

export const languagesList: Record<string, string> = {}
for (const locale of i18n.localesList) {
    languagesList[locale] = `${i18n.t(locale, 'locale:flag')} ${i18n.t(locale, 'locale:language')}`
}
const languages = Markup.keyboard(chunk(Object.values(languagesList), 3)).resize()

const citiesList = (locale: string) =>
    Object.keys(City).map((cityAbbr) => ({
        text: i18n.t(locale, cityAbbr),
        callback_data: cityAbbr,
    }))
const city = (locale: string) => Markup.inlineKeyboard(chunk(citiesList(locale), 2))

const start = (locale: string) => Markup.keyboard([[i18n.t(locale, 'welcome:start')]]).resize()
const ok = (locale: string) => Markup.keyboard([[i18n.t(locale, 'button:ok')]]).resize()
const empty = Markup.removeKeyboard()
const cancel = (locale: string) => Markup.keyboard([[i18n.t(locale, 'button:cancel')]]).resize()
const gender = (locale: string) => Markup.keyboard([[i18n.t(locale, 'gender:male'), i18n.t(locale, 'gender:female')]]).resize()
const interest = (locale: string) => Markup.keyboard([[i18n.t(locale, 'genderPreference:male'), i18n.t(locale, 'genderPreference:female'), i18n.t(locale, 'genderPreference:all')]]).resize()

const main = (locale: string, status: Status = 'default') =>
    Markup.keyboard([
        [i18n.t(locale, status == 'default' ? 'button:searchPartner' : status == 'chatting' ? 'button:leavePartner' : 'button:stopSearching'), i18n.t(locale, 'button:viewProfiles')],
        [i18n.t(locale, 'button:profile'), i18n.t(locale, 'button:settings')],
    ]).resize()

const settings = (locale: string) =>
    Markup.inlineKeyboard([
        [{ text: i18n.t(locale, 'button:changeLanguage'), callback_data: 'changeLanguage' }],
        [{ text: i18n.t(locale, 'button:deleteUser'), callback_data: 'deleteUser' }],
        [{ text: i18n.t(locale, 'button:changeProfile'), callback_data: 'changeProfile' }],
    ])
const deleteUser = (locale: string) => Markup.keyboard([[i18n.t(locale, 'button:deleteUserAnyway')], [i18n.t(locale, 'button:cancel')]]).resize()

const viewProfile = Markup.keyboard([['❤️', '💌', '👎', '💤']]).resize()
const viewLiked = Markup.keyboard([['1. ❤️', '2. ❌']]).resize()
const viewLikedProfile = Markup.keyboard([['❤️', '💌', '👎']]).resize()
const report = (locale: string, victim: number, intruder: number, type: ReportType, message: string | null) =>
    Markup.inlineKeyboard([[{ text: i18n.t(locale, 'button:report'), callback_data: `report_${victim}_${intruder}_${type}_${message}` }]])
const respond = (locale: string, reciever: number) => Markup.inlineKeyboard([[{ text: i18n.t(locale, 'button:respond'), callback_data: `respond_${reciever}` }]])

const oneButton = (text: string) => Markup.keyboard([[text]]).resize()

const admin = Markup.keyboard([['Metrics', 'Database'], ['Change user', 'Change profile', 'Change queue'], ['Select user', 'Select profile'], ['Exit admin panel']]).resize()

const reportAction = (report: Report) =>
    Markup.inlineKeyboard([
        [
            { text: 'Warn the intruder', callback_data: `warn_${report.intruder}` },
            { text: 'Ban the intruder', callback_data: `ban_${report.intruder}` },
        ],
        [{ text: 'Warn the victim', callback_data: `warn_${report.victim}` }],
        [{ text: 'Delete the report', callback_data: `skipReport_${report.id}` }],
    ])
export default {
    empty,
    languages,
    cancel,
    gender,
    interest,
    city,
    main,
    start,
    ok,
    settings,
    deleteUser,
    viewProfile,
    viewLiked,
    viewLikedProfile,
    report,
    respond,
    oneButton,
    admin,
    reportAction,
}
