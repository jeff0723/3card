import { createSlice } from '@reduxjs/toolkit'
import { Profile } from 'generated/types';


export interface UserState {
    isConnected: boolean;
    isAuthenticated: boolean;
    hasProfile: boolean;
    currentUser: Profile | null;
}
export const initialState: UserState = {
    isConnected: false,
    isAuthenticated: false,
    hasProfile: false,
    currentUser: null,
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
        },
        setHasProfile(state, { payload: { hasProfile } }) {
            state.hasProfile = hasProfile
        },
        setCurrentUser(state, { payload: { currentUser } }) {
            state.currentUser = currentUser
        },

    }
})

export const {
    setIsConnected,
    setIsAuthenticated,
    setHasProfile,
    setCurrentUser
} = userSlice.actions
export default userSlice.reducer