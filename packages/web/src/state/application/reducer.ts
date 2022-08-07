import { createSlice } from '@reduxjs/toolkit'
import { Profile } from 'generated/types';


export interface ApplicationState {
    recommendUser?: Profile | null,
    isApplicationLoading: boolean,
    recommendedProfiles: Profile[],
}
export const initialState: ApplicationState = {
    recommendUser: null,
    isApplicationLoading: false,
    recommendedProfiles: []
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
        }

    }
})

export const {
    updateRecommedUser,
    updateLoadingStatus,
    updateRecommendedProfiles
} = applicationSlice.actions
export default applicationSlice.reducer