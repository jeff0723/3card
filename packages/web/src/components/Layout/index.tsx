import React, { FC, ReactNode, Suspense, } from 'react'
import Head from 'next/head'
import styled from 'styled-components'
import dynamic from 'next/dynamic'

const Navbar = dynamic(() => import('components/Navbar'), { suspense: true })
const SideBar = dynamic(() => import('./SideBar'), { suspense: true })
interface Props {
    children: ReactNode
}
const Container = styled.div`
    max-width: 1200px;
    margin: 0 auto;
`

const Content = styled.div`
    display: flex;
`

const Layout: FC<Props> = ({ children }) => {
    return (
        <Container>
            <Suspense fallback={<h1>Loading</h1>}>
                <Navbar />
                <Content>
                    <SideBar />
                    {children}
                </Content>
            </Suspense>
        </Container>
    )
}

export default Layout