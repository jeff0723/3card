import React, {
    ButtonHTMLAttributes,
    DetailedHTMLProps,
    forwardRef,
    ReactNode
} from 'react'
import clsx from 'clsx'

interface Props
    extends DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
    > {
    loading?: boolean
    icon?: ReactNode
    outline?: boolean
    color?: "blue" | "red" | "green" | "yellow"
    children?: ReactNode
    className?: string
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
    {
        className = '',
        loading,
        icon,
        children,
        outline,
        color = "blue",
        ...rest
    },
    ref
) {
    return (
        <button
            ref={ref}
            className={clsx(
                {
                    'border border-transparent bg-primary-blue bg-opacity-30 text-sky-400 hover:bg-primary-blue hover:bg-opacity-50':
                        !outline && color === 'blue',
                    'border border-primary-blue bg-black text-primary-blue text-primary-blue':
                        outline && color === 'blue',
                    'border border-transparent bg-yellow bg-opacity-30 text-yellow hover:bg-yellow hover:bg-opacity-50':
                        !outline && color === 'yellow',
                    'border border-yellow bg-black text-yello text-yellow':
                        outline && color === 'yellow',
                },
                'flex space-x-1.5 items-center rounded-[16px] px-2 py-2 text-sm font-medium disabled:bg-opacity-50 disabled:cursor-not-allowed',
                className)}
            disabled={loading}
            type={rest.type}
            {...rest}
        >
            {icon}
            <div>{children}</div>
        </button>
    )
})


export default Button