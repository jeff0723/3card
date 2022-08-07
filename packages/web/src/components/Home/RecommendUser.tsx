import { useState } from 'react'
import { useAppSelector } from 'state/hooks'
import styled from 'styled-components'
import {
    MediaSet,
    NftImage,
    Profile
} from 'generated/types'
import { FiArrowUpRight } from 'react-icons/fi'
type Props = {}

const Card = styled.div`
    height: 195px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    overflow: hidden;
    text-overlow: ellipsis;
    &:hover {
        cursor: pointer;
        background: rgba(255, 255, 255, 0.11);
    }   
`
const Content = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0px;
    gap: 16px;
`
const InfoBox = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 0px;
    width: 100%;
   
`

const RecommendUser = (props: Props) => {
    const profile = useAppSelector(state => state.application.recommendUser) as Profile & { picture: MediaSet & NftImage }
    console.log('profile: ', profile)
    console.log('profile image:', profile)
    const [profileUrl, setProfileUrl] = useState('')

    return (
        <Card>
            Frens Card Today
            {profile ?
                <>
                    <Content >
                        <img className='w-[96px] h-[96px] rounded-full' src={profile?.picture?.original?.url || profile?.picture?.uri} />
                        <div className='flex flex-col gap-2 flex-1'>
                            <InfoBox>
                                <div>{profile?.name?.slice(0, 20)}</div>
                                <div className='text-gray-400'>@{profile?.handle}</div>
                            </InfoBox>
                            <div className='flex justify-between'>
                                <InfoBox>
                                    <div>{profile.stats.totalFollowing}</div>
                                    <div>following</div>
                                </InfoBox>
                                <InfoBox>
                                    <div>{profile.stats.totalFollowers}</div>
                                    <div>followers</div>
                                </InfoBox>
                            </div>

                        </div>

                    </Content>
                    <div className='text-primary-blue'>Show more</div>
                </>
                :
                <div>No profile</div>
            }

        </Card>
    )
}

export default RecommendUser