export interface SettingsStateInterface {
  language: string;
}

function state (): SettingsStateInterface {
  return {
    language: 'ca'
  }
}

export default state
