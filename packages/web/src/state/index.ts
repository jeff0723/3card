import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query/react'

import user from './user/reducer'


const store = configureStore({
    reducer: {
        user
    }
})

setupListeners(store.dispatch)

export default store
export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch