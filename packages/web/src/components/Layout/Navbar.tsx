import { ConnectButton } from '@rainbow-me/rainbowkit';
import styled from 'styled-components';

type Props = {}
const NavbarContainer = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 10px 16px 0px 16px;
    position: fixed;
    z-index: 40;
    max-width: 1200px;
    width: 100%;
    height: 60px;
    background-color: #000000;
`

const Navbar = (props: Props) => {

    return (
        <>
            <NavbarContainer >
                <img src='/logo.png' width={50} height={50} />
                <ConnectButton />
            </NavbarContainer>

        </>
    )
}

export default Navbar