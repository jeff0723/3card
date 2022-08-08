import { FC, ReactNode } from 'react'

interface CardProps {
    children: ReactNode

}

export const Card: FC<CardProps> = ({
    children,
}) => {
    return (
        <div
            className='border border-border-gray rounded-lg'
        >
            {children}
        </div>
    )
}


