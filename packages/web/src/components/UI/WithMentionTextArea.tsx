import { SEARCH_USERS_QUERY } from 'graphql/query/search-user'
import React from 'react'
import { MediaSet, NftImage, Profile } from 'generated/types'
import { useLazyQuery } from '@apollo/client'
import { Mention, MentionsInput, SuggestionDataItem } from 'react-mentions'
import { Dispatch, FC, SetStateAction } from 'react'
import getIPFSLink from 'utils/getIPFSLink'
import clsx from 'clsx'

type Props = {
    postInput: string
    setPostInput: Dispatch<string>
    placeholder: string
    outline?: boolean
    maxHeight?: number
    minHeight?: number
}
type UserSuggestion = {
    uid: string
    id: string
    display: string
    name: string
    picture: string
}
interface UserProps {
    suggestion: UserSuggestion
    focused: boolean
}

const User: FC<UserProps> = ({ suggestion, focused }) => (
    <div className='flex p-4 gap-4 bg-black bg-opacity-90 text-[12px] hover:bg-opacity-80'
    >
        <img src={getIPFSLink(suggestion.picture)} className='w-12 h-12 rounded-full' />
        <div className='flex flex-col'>
            <div>{suggestion?.name}</div>
            <div className='text-gray-400'>@{suggestion?.display}</div>

        </div>
    </div>
)


const WithMentionTextArea: FC<Props> = ({ postInput, setPostInput, placeholder, outline = false, maxHeight = 600, minHeight = 90 }) => {
    const [searchUsers] = useLazyQuery(SEARCH_USERS_QUERY, {
        onCompleted(data) {
            console.log(
                '[Lazy Query]',
                `Fetched ${data?.search?.items?.length} user mention result`
            )
        },
    })
    const fetchUsers = (query: string, callback: any) => {
        if (!query) return

        searchUsers({
            variables: { request: { type: 'PROFILE', query, limit: 5 } }
        })
            .then(({ data }) =>
                data?.search?.items?.map(
                    (user: Profile & { picture: MediaSet & NftImage }) => ({
                        uid: user.id,
                        id: user.handle,
                        display: user.handle,
                        name: user?.name ?? user?.handle,
                        picture:
                            user?.picture?.original?.url ??
                            user?.picture?.uri
                    })
                )
            )
            .then(callback)
    }
    console.log("minHeight:", minHeight)
    return (
        <MentionsInput
            className={
                clsx(
                    { "rounded-lg border border-border-gray": outline },
                    `mention-input min-h-[${minHeight}px] max-h-[${maxHeight}px] w-full bg-transparent text-[20px]`
                )}
            value={postInput}
            placeholder={placeholder}
            onChange={(e) => {
                setPostInput(e.target.value)

            }}
        >
            <Mention
                trigger="@"
                displayTransform={(login) => `@${login} `}
                markup="@__id__ "
                //@ts-ignore
                renderSuggestion={(suggestion: UserSuggestion, focused) => <User suggestion={suggestion} focused={focused} />}
                data={fetchUsers}
            />
        </MentionsInput>

    )
}

export default WithMentionTextArea