/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Quasar } from 'quasar'
import { boot } from 'quasar/wrappers'
import { i18n } from 'src/boot/i18n'

export default boot(async ({ store }) => {
  const langIso = store.state.settings.language || 'ca'

  i18n.global.locale = langIso

  try {
    await import(
    /* webpackInclude: /(ca|es)\.js$/ */
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      'quasar/lang/' + langIso
    )
      .then(lang => {
        // console.log('lang', lang)
        Quasar.lang.set(lang.default)
      })
  } catch (err) {
    console.log(err)
  // Requested Quasar Language Pack does not exist,
  // let's not break the app, so catching error
  }
})
