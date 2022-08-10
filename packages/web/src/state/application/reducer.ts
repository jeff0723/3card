import { createSlice } from '@reduxjs/toolkit'
import { Profile } from 'generated/types';


export interface ApplicationState {
    recommendUser?: Profile | null,
    isApplicationLoading: boolean,
    recommendedProfiles: Profile[],
    isNewMessageModalOpen: boolean
}
export const initialState: ApplicationState = {
    recommendUser: null,
    isApplicationLoading: false,
    recommendedProfiles: [],
    isNewMessageModalOpen: false
}

const applicationSlice = createSlice({
    name: 'application',
    initialState,
    reducers: {
        updateRecommedUser(state, { payload: { recommendUser } }) {
            state.recommendUser = recommendUser
        },
        updateLoadingStatus(state, { payload: { isApplicationLoading } }) {
            state.isApplicationLoading = isApplicationLoading
        },
        updateRecommendedProfiles(state, { payload: { recommendedProfiles } }) {
            state.recommendedProfiles = recommendedProfiles
        },
        setIsNewMessageModalOpen(state, { payload: { isNewMessageModalOpen } }) {
            state.isNewMessageModalOpen = isNewMessageModalOpen
        }

    }
})

export const {
    updateRecommedUser,
    updateLoadingStatus,
    updateRecommendedProfiles,
    setIsNewMessageModalOpen
} = applicationSlice.actions
export default applicationSlice.reducer