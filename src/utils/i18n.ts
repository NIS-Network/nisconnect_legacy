/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs'
import path from 'path'

interface LocaleData {
    [key: string]: string
}

interface Locales {
    [languageCode: string]: LocaleData
}

interface I18nOptions {
    directory: string
    default: string
}

class I18n {
    private locales: Locales = {}

    constructor(private options: I18nOptions) {
        this.loadLocales()
    }

    private loadLocales() {
        if (!fs.existsSync(this.options.directory)) {
            throw new Error(`Locales directory "${this.options.directory}" does not exist`)
        }
        const files = fs.readdirSync(this.options.directory)
        files.forEach((file: string) => {
            if (file.endsWith('.json')) {
                const languageCode = file.split('.')[0]
                const filePath = path.join(this.options.directory, file)
                const data = fs.readFileSync(filePath, 'utf-8')
                this.locales[languageCode] = JSON.parse(data)
            }
        })
    }

    private getLocale(languageCode: string): LocaleData {
        const locale = this.locales[languageCode]
        if (!locale) {
            throw new Error(`Locale file ${languageCode}.json does not exist in ${this.options.directory}`)
        }
        return locale
    }

    public get localesList() {
        return Object.keys(this.locales)
    }

    // todo: redo completely
    private pluralization(translation: string, values: Record<string, any>, languageCode: string) {
        const regex = /\${pluralize\((\w+),\s*({(?:\s*\w+\s*:\s*.+\s*,\s*)*\s*\w+\s*:\s*.+\s*})\s*\)}/
        const match = translation.match(regex)
        if (!match) {
            return translation
        }
        const value = match[1]
        const n = Number(values[value])
        if (isNaN(n)) {
            throw new Error(`Value of ${value} at ${translation} is not a number`)
        }
        const pluralForms = match[2].replace('{', '').replace('}', '').split(',')
        let pluralForm = ''
        switch (languageCode) {
            case 'kz':
                pluralForm = 'one'
                break
            case 'ru':
                if (n % 10 == 1 && n % 100 != 11) {
                    pluralForm = 'one'
                } else if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) {
                    pluralForm = 'few'
                } else {
                    pluralForm = 'many'
                }
                break
            default:
                if (n == 1) {
                    pluralForm = 'one'
                } else {
                    pluralForm = 'many'
                }
                break
        }
        let pluralValue = ''
        for (let form of pluralForms) {
            form = form.trim()
            const key = form.split(':')[0].trim()
            const value = form.split(':')[1].trim()
            if (key == pluralForm) {
                pluralValue = value
                break
            }
        }
        return translation.replace(new RegExp(regex, 'g'), pluralValue)
    }

    public t(languageCodeOrKey: string, keyOrData?: string | Record<string, any>, data?: Record<string, any>): string {
        let languageCode: string = this.options.default
        let key: string = ''
        let values: Record<string, any> = {}

        if (typeof languageCodeOrKey === 'string') {
            if (typeof keyOrData === 'string') {
                languageCode = languageCodeOrKey
                key = keyOrData
                values = data || {}
            } else {
                key = languageCodeOrKey
                values = keyOrData || {}
            }
        }

        const localeData = this.getLocale(languageCode)
        let translation = localeData[key] || ''
        translation = this.pluralization(translation, values, languageCode)

        Object.keys(values).forEach((valueKey) => {
            translation = translation.replace(new RegExp(`\\$\\{${valueKey}\\}`, 'g'), values[valueKey])
        })

        return translation
    }
}

export const i18n = new I18n({ default: 'en', directory: path.resolve(__dirname, '..', 'locales') })
export default I18n
