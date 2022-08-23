import { Profile, MediaSet, NftImage } from "./types"
export type UserProfile = Profile & { picture: MediaSet & NftImage }