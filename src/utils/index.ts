import Together from 'together-ai'
import { createCerebras } from '@ai-sdk/cerebras';


export const createTogetherClient = () => {
  const apiKey = import.meta.env.VITE_TOGETHER_API_KEY
  if (!apiKey) {
    console.error(
      'VITE_TOGETHER_API_KEY is not defined in environment variables.'
    )
    return null
  }

  return new Together({ apiKey })
}

export const createCerebrasClient = () => {
  const apiKey = import.meta.env.VITE_CEREBRAS_API_KEY
  if (!apiKey) {
    console.error(
      'VITE_CEREBRAS_API_KEY is not defined in environment variables.'
    )
    return null
  }

  return  createCerebras({
    apiKey
  });
}

export const generateRandomString = (length: number): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
