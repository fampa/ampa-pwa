export interface SettingsStateInterface {
  language: string
  fallbackLanguage: string
  presentedChoice: boolean
}

function state (): SettingsStateInterface {
  return {
    language: 'ca',
    fallbackLanguage: 'es',
    presentedChoice: false
  }
}

export default state
