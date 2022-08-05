import React from 'react'
import styled from 'styled-components'

type Props = {}
const Column = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 16px;
    gap:10px;
    width: 224px;
    border-right: 1px solid #2F3336;
`
const Text = styled.div`
    display: flex;
    padding: 12px;
    font-weight: 400;
    font-size: 20px;
    line-height: 24px;
`
function SideBar({ }: Props) {
    return (
        <Column>
            <Text>
                Feeds
            </Text>
            <Text>
                Explore
            </Text>
            <Text>
                Messages
            </Text>
            <Text>
                Profile
            </Text>
        </Column>
    )
}

export default SideBar