import { createSlice } from '@reduxjs/toolkit'


export interface UserState {
    isConnected: boolean;
    isAuthenticated: boolean;
}
export const initialState: UserState = {
    isConnected: false,
    isAuthenticated: false,
}

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setIsConnected(state, { payload: { isConnected } }) {
            state.isConnected = isConnected
        },
        setIsAuthenticated(state, { payload: { isAuthenticated } }) {
            state.isAuthenticated = isAuthenticated
        }

    }
})

export const {
    setIsConnected,
    setIsAuthenticated
} = userSlice.actions
export default userSlice.reducer