import { useLazyQuery } from '@apollo/client'
import { Input } from 'components/UI/Input'
import { Spinner } from 'components/UI/Spinner'
import { Profile, MediaSet, NftImage } from 'generated/types'
import { DirectiveLocation } from 'graphql'
import { SEARCH_USERS_QUERY } from 'graphql/query/search-user'
import Link from 'next/link'
import React, { useState, ChangeEvent, useRef } from 'react'
import { HiSearch, HiOutlineX } from 'react-icons/hi'
import UserProfile from './UserProfile'
import clsx from 'clsx'
type Props = {}
const Search = (props: Props) => {
    const [searchText, setSearchText] = useState<string>('')
    const dropdownRef = useRef(null)

    const [searchUsers, { data: searchUsersData, loading: searchUsersLoading }] =
        useLazyQuery(SEARCH_USERS_QUERY, {
            onCompleted(data) {
                console.log(
                    '[Lazy Query]',
                    `Fetched ${data?.search?.items?.length} search result for ${searchText}`
                )
            }
        })

    const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
        const keyword = e.target.value
        setSearchText(keyword)

        searchUsers({
            variables: { request: { type: 'PROFILE', query: keyword, limit: 8 } }
        })

    }
    return (
        <div className='w-full relative'>
            <div className='flex items-center text-lg w-full bg-white bg-opacity-5 rounded-lg px-3 py-2'>

                <HiSearch />
                <input value={searchText} className='pl-2 bg-transparent outline-none text-[15px]' placeholder='Search...' onChange={handleSearch} />

                <div className={clsx(
                    'cursor-pointer',
                    searchText ? 'visible' : 'invisible'
                )} onClick={() => {
                    setSearchText('')
                }}>
                    <HiOutlineX />

                </div>

            </div>
            {searchText.length > 0 && (<div
                className="flex absolute flex-col mt-2 w-full "
                ref={dropdownRef}
            >
                <div className="bg-black rounded-xl border border-border-gray overflow-y-auto py-2 max-h-[80vh]">
                    {searchUsersLoading ? (
                        <div className="py-2 px-4 space-y-2 text-sm font-bold text-center">
                            <Spinner size="sm" className="mx-auto" />
                            <div>Searching users</div>
                        </div>
                    ) : (
                        <>
                            {searchUsersData?.search?.items?.map((profile: Profile & { picture: MediaSet & NftImage }) => (
                                <div
                                    key={profile?.handle}
                                    className="py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <Link href={`/user/${profile?.handle}`}>
                                        <a
                                            href={`/user/${profile?.handle}`}
                                            onClick={() => setSearchText('')}
                                        >
                                            <UserProfile profile={profile} />
                                        </a>
                                    </Link>
                                </div>
                            ))}
                            {searchUsersData?.search?.items?.length === 0 && (
                                <div className="py-2 px-4">No matching users</div>
                            )}
                        </>
                    )}
                </div>
            </div>)}

        </div>
    )
}

export default Search