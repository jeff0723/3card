import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(_: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return <div className="flex justify-center items-center h-screen">
                <div className="flex flex-col">
                    <div className="text-[20px]">An error just happened!</div>
                    <div className="text-gray-400">Please refresh your page to continue to use our app</div>
                    <div>Contact: jeffreylin0723@gmail.com</div>
                </div>
            </div>;
        }

        return this.props.children;
    }
}

export default ErrorBoundary;