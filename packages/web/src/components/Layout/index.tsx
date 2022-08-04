import React, { FC, ReactNode, } from 'react'
import Head from 'next/head'
import Navbar from 'components/Navbar'

interface Props {
    children: ReactNode
}
const Layout: FC<Props> = ({ children }) => {
    return (
        <>
            <Navbar />
            {children}
        </>
    )
}

export default Layout