import React from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { BsTwitter } from 'react-icons/bs';

import styled from 'styled-components';

type Props = {}
const NavbarContainer = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 10px 16px;
    position: sticky;
`
const Navbar = (props: Props) => {
    return (
        <NavbarContainer >
            <BsTwitter style={{ fontSize: '32px' }} />
            <ConnectButton />
        </NavbarContainer>
    )
}

export default Navbar