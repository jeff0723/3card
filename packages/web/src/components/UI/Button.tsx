import React, {
    ButtonHTMLAttributes,
    DetailedHTMLProps,
    forwardRef,
    ReactNode
} from 'react'

interface Props
    extends DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
    > {
    loading?: boolean
    icon?: ReactNode
    children?: ReactNode
    className?: string
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
    {
        className = '',
        loading,
        icon,
        children,
        ...rest
    },
    ref
) {
    return (
        <button
            ref={ref}
            className="flex space-x-1.5 items-center rounded-md border border-transparent bg-primary-blue bg-opacity-30 px-4 py-2 text-sm font-medium text-sky-400 hover:bg-primary-blue hover:bg-opacity-50 focus:ring-primary-blue disabled:bg-opacity-50"
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