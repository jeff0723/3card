import React from "react";
import clsx from "clsx";
type Props = {
    isMe: boolean;
    message: string;
    user: string | undefined;
    updateAt: string;
};

const SingleMessage = ({ isMe, message, user, updateAt }: Props) => {
    return (
        <div
            className={clsx(
                {
                    "justify-start": !isMe,
                    "justify-end": isMe,
                },
                "flex w-full"
            )}
        >
            <div
                className={clsx(
                    {
                        "bg-primary-blue": isMe,
                        "bg-white bg-opacity-30": !isMe,
                    },
                    "px-4 py-3 rounded-lg"
                )}
            >
                {message}
            </div>
        </div>
    );
};

export default SingleMessage;
