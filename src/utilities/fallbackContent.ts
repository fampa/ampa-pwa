import { Content } from 'src/models/Content'
import { i18n } from 'src/boot/i18n'

export const fallbackContent = (content: Content, field: string) => {
  const availableContent = content.translations.find(tr => tr.language === i18n.global.locale)[field]

  if (availableContent?.length > 0) {
    // console.log('availableContent', availableContent)
    return availableContent
  }

  for (const locale of i18n.global.availableLocales) {
    const contentFallback = content.translations.find(tr => tr.language === locale)[field]
    if (contentFallback?.length > 0) {
    //   console.log('contentFallback', contentFallback)
      return contentFallback
    }
  }
}
