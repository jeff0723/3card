import Link from 'next/link'
import React from 'react'
import styled from 'styled-components'

type Props = {}
const Column = styled.div`
    display: flex;
    flex-direction: column;
    padding: 16px;
    gap:10px;
    width: 224px;
    border-right: 1px solid #2F3336;
`
const Text = styled.div`
    display: flex;
    align-items: flex-start;
    padding: 12px;
    font-weight: 400;
    font-size: 20px;
    line-height: 24px;
`

function SideBar({ }: Props) {
    return (
        <Column>
            <Link href='/'>
                <div className='rounded-md hover:bg-white hover:bg-opacity-10'>
                    <Text>
                        Feeds
                    </Text>
                </div>
            </Link>
            <Link href='explore' as={'/explore'}>
                <div className='rounded-md hover:bg-white hover:bg-opacity-10'>
                    <Text>
                        Explore
                    </Text>
                </div>
            </Link>
            <Link href='messages'>
                <div className='rounded-md hover:bg-white hover:bg-opacity-10'>
                    <Text>
                        Messages
                    </Text>
                </div>
            </Link>
            <Link href='profile'>
                <div className='rounded-md hover:bg-white hover:bg-opacity-10'>
                    <Text>
                        Profile
                    </Text>
                </div>
            </Link>

        </Column>
    )
}

export default SideBar