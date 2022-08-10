import Link from 'next/link'
import React from 'react'
import styled from 'styled-components'


type Props = {}
const Container = styled.div`
    height: calc(100vh - 60px);
`
const Column = styled.div`
    display: flex;
    flex-direction: column;
    padding: 16px;
    gap:10px;
    width: 224px;

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
        <Container className='border border-transparent border-r-[#2F3336]'>
            <Column>
                <Link href='/'>
                    <div className='rounded-md hover:bg-white hover:bg-opacity-10'>
                        <Text>
                            Feeds
                        </Text>
                    </div>
                </Link>
                <Link href='/explore' >
                    <div className='rounded-md hover:bg-white hover:bg-opacity-10'>
                        <Text>
                            Explore
                        </Text>
                    </div>
                </Link>
                <Link href='/messages'>
                    <div className='rounded-md hover:bg-white hover:bg-opacity-10'>
                        <Text>
                            Messages
                        </Text>
                    </div>
                </Link>
                <Link href='/profile'>
                    <div className='rounded-md hover:bg-white hover:bg-opacity-10'>
                        <Text>
                            Profile
                        </Text>
                    </div>
                </Link>

            </Column>
        </Container>
    )
}

export default SideBar