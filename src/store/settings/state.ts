export interface SettingsStateInterface {
  language: string
  fallbackLanguage: string
}

function state (): SettingsStateInterface {
  return {
    language: 'ca',
    fallbackLanguage: 'es'
  }
}

export default state
