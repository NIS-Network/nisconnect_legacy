import { Markup } from 'telegraf'
import chunk from './utils/chunk'
import { City } from '@prisma/client'
import { i18n } from './utils/i18n'

export const languagesList: Record<string, string> = {}
for (const locale of i18n.localesList) {
    languagesList[locale] = `${i18n.t(locale, 'flag')} ${i18n.t(locale, 'language')}`
}
const languages = Markup.keyboard(chunk(Object.values(languagesList), 3)).resize()

const citiesList = (locale: string) =>
    Object.keys(City).map((cityAbbr) => ({
        text: i18n.t(locale, cityAbbr),
        callback_data: cityAbbr,
    }))
const city = (locale: string) => Markup.inlineKeyboard(chunk(citiesList(locale), 2))

const start = (locale: string) => Markup.keyboard([[i18n.t(locale, 'welcomeStart')]]).resize()
const ok = (locale: string) => Markup.keyboard([[i18n.t(locale, 'ok')]]).resize()
const empty = Markup.removeKeyboard()
const cancel = (locale: string) => Markup.keyboard([[i18n.t(locale, 'cancel')]]).resize()
const gender = (locale: string) => Markup.keyboard([[i18n.t(locale, 'genderMale'), i18n.t(locale, 'genderFemale')]]).resize()
const interest = (locale: string) => Markup.keyboard([[i18n.t(locale, 'genderPreferenceMale'), i18n.t(locale, 'genderPreferenceFemale'), i18n.t(locale, 'genderPreferenceAll')]]).resize()
const main = Markup.keyboard([['Profile']]).resize()

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
}
