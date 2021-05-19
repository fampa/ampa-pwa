import { validateSpanishId } from 'spain-id'
import { isValidIBAN } from 'ibantools'

export const validatePhone = (phone: string): boolean => {
  const phonePattern = /(6|7|9)\d{8}$/
  return phonePattern.test(phone)
}

export const validateEmail = (email: string): boolean => {
  const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/
  return emailPattern.test(email)
}

export const validateNif = (nif: string): boolean => validateSpanishId(nif)

export const validateIban = (iban: string): boolean => isValidIBAN(iban)
