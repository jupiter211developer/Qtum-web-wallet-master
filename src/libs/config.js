import store from 'store'
import locales from '../locales'

export default {
    set(key, value, expires = 86400) {
        store.set(key, {
            value,
            expired_at: +new Date() + expires * 1000
        })
    },
    get(key, defaultValue) {
        const temp = store.get(key)
        try {
            const value = temp.value
            if (value === undefined || temp.expired_at < +new Date()) {
                return defaultValue
            }
            return value
        } catch (e) {
            return defaultValue
        }
    },
    getLan() {
        let locale = this.get('lan')
        navigator.languages.forEach(language => {
            if (locale === undefined && locales.locales.indexOf(language) !== -1) {
                locale = language
            }
        })
        if (locale === undefined) {
            locale = 'en'
        }
        return locale
    },
    getNetwork() {
        return this.get('network', 'mainnet')
    },
    getMode() {
        return this.get('mode', 'normal')
    },
    getNotifyMessage(msg, t) {
        return msg.split(' ').reduce((msg, current) => {
            let tmsg = t('common.notify.' + current)
            tmsg = tmsg === 'common.notify.' + current ? ' ' + current : tmsg
            return msg + tmsg
          }, '')
    }
}
