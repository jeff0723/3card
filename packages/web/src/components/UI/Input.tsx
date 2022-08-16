import clsx from 'clsx'
import dynamic from 'next/dynamic'
import { ComponentProps, forwardRef, ReactNode, useId } from 'react'


interface Props extends Omit<ComponentProps<'input'>, 'prefix'> {
    label?: string
    prefix?: string | ReactNode
    iconLeft?: ReactNode
    iconRight?: ReactNode
    className?: string
    helper?: ReactNode
    error?: boolean
}

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
    {
        label,
        prefix,
        type = 'text',
        iconLeft,
        iconRight,
        error,
        className = '',
        helper,
        ...props
    },
    ref
) {
    const id = useId()

    const iconStyles = [
        'text-zinc-500 [&>*]:peer-focus:text-brand-500 [&>*]:h-5',
        { '!text-red-500 [&>*]:peer-focus:!text-red-500': error }
    ]

    return (
        <label className="w-full" htmlFor={id}>
            {label && (
                <div className="flex items-center mb-1 space-x-1.5">
                    <div className="font-medium text-gray-800 dark:text-gray-200">
                        {label}
                    </div>
                </div>
            )}
            <div className="flex">

                <div
                    className={clsx(
                        { '!border-red-500': error },
                        { 'focus-within:ring-1': !error },
                        { 'rounded-r-xl': prefix },
                        { 'rounded-xl': !prefix },
                        {
                            'opacity-60 bg-gray-500 bg-opacity-20': props.disabled
                        },
                        'flex items-center border bg-white bg-opacity-10 outline-none w-full'
                    )}
                >
                    <input
                        id={id}
                        className={clsx(
                            { 'placeholder-red-500': error },
                            { 'rounded-r-xl': prefix },
                            { 'rounded-xl': !prefix },
                            'peer border-none  outline-none bg-transparent w-full',
                            className
                        )}
                        type={type}
                        ref={ref}
                        {...props}
                    />
                    <span
                        tabIndex={-1}
                        className={clsx({ 'order-first pl-3': iconLeft }, iconStyles)}
                    >
                        {iconLeft}
                    </span>
                    <span
                        tabIndex={-1}
                        className={clsx({ 'order-last pr-3': iconRight }, iconStyles)}
                    >
                        {iconRight}
                    </span>
                </div>
            </div>
        </label>
    )
})
