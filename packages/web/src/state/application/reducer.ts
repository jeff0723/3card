import { createSlice } from '@reduxjs/toolkit'
import { Profile, MediaSet, NftImage } from 'generated/types';

interface Item {
    [key: string]: string
    pubDate: string
    title: string
    isoDate: string
    link: string
    thumbnail: string
    creator: string
    favIcon: string
}
export interface ApplicationState {
    recommendUser?: Profile & { picture: MediaSet & NftImage } | null;
    isApplicationLoading: boolean;
    recommendedProfiles: Profile & { picture: MediaSet & NftImage } | [];
    isNewMessageModalOpen: boolean;
    loadingNews: boolean;
    news: Item[];
}
export const initialState: ApplicationState = {
    recommendUser: null,
    isApplicationLoading: false,
    recommendedProfiles: [],
    isNewMessageModalOpen: false,
    loadingNews: false,
    news: []
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
        },
        setLoadingNews(state, { payload: { loadingNews } }) {
            state.loadingNews = loadingNews
        },
        updateNews(state, { payload: { news } }) {
            state.news = news
        }

    }
})

export const {
    updateRecommedUser,
    updateLoadingStatus,
    updateRecommendedProfiles,
    setIsNewMessageModalOpen,
    setLoadingNews,
    updateNews
} = applicationSlice.actions
export default applicationSlice.reducer