import React from 'react'
import styled from 'styled-components'

type Props = {}
const Container = styled.div`
    display: flex;
    width: 100%;
    justify-content:center;
    align-items: center;
    border-radius: 8px;
    background: rgba(0, 148, 255, 0.3);
    gap: 10px;
    padding: 8px;
`
const CreateButon = styled.div`
    padding:8px 16px;
    background: rgba(0, 148, 255, 0.5);
    border-radius: 8px;
    &:hover {
        background: rgba(0, 148, 255, 0.7);
        cursor: pointer;
    }
`
const CreateProfileHelper = (props: Props) => {
    return (
        <Container>
            <div>You don&apos;t  have a profile yet
            </div>
            <CreateButon>Create</CreateButon>
        </Container>
    )
}

export default CreateProfileHelper