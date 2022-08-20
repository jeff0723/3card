import dynamic from "next/dynamic";
import { FC, ReactNode, Suspense, useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import styled from "styled-components";

const Navbar = dynamic(() => import("./Navbar"), { suspense: true });
const SideBar = dynamic(() => import("./SideBar"), { suspense: true });
interface Props {
    children: ReactNode;
}
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Content = styled.div`
  display: flex;
  padding-top: 60px;
  height: 100vh
`;
const toastOptions = {
    style: {
        background: "rgba(0, 0, 0)",
        color: "#ffffff",
    },
    success: {
        className: "border border-green-500",
        iconTheme: {
            primary: "#10B981",
            secondary: "white",
        },
    },
    error: {
        className: "border border-red-500",
        iconTheme: {
            primary: "#EF4444",
            secondary: "white",
        },
    },
    loading: { className: "border border-yello-300" },
};
const Layout: FC<Props> = ({ children }) => {
    const [mounted, setMounted] = useState<boolean>(false);
    useEffect(() => {
        setMounted(true);
    }, []);
    if (!mounted) return <h1>Loading</h1>;

    return (
        <Container>
            <Toaster position="top-right" toastOptions={toastOptions} />
            <Suspense fallback={<h1>Loading</h1>}>
                <Navbar />
                <Content>
                    <SideBar />
                    {children}
                </Content>
            </Suspense>
        </Container>
    );
};

export default Layout;
