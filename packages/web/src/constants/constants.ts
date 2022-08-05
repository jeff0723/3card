export const ALCHEMY_KEY = process.env.NEXT_PUBLIC_ALCHEMY_KEY

export const API_URL = process.env.NODE_ENV === 'production'
    ? 'https://api.lens.dev'
    : 'https://api-mumbai.lens.dev'