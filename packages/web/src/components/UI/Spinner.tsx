import clsx from 'clsx'
import { FC } from 'react'

interface Props {
    className?: string
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'super' | 'danger'
    size?: 'xs' | 'sm' | 'md' | 'lg'
}

export const Spinner: FC<Props> = ({
    className = '',
    size = 'md'
}) => {
    return (
        <div
            className={clsx(
                {
                    'h-4 w-4 border-[2px]': size === 'xs',
                    'h-5 w-5 border-2': size === 'sm',
                    'h-8 w-8 border-[3px]': size === 'md',
                    'h-10 w-10 border-4': size === 'lg'
                },
                'animate-spin rounded-full border-t-primary-blue border-black',
                className
            )}
        />
    )
}
