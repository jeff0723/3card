import React from 'react'

type Props = {}

const FeedLoading = (props: Props) => {
    return (
        <div className='flex gap-[10px] border-b border-border-gray pb-4 pt-4 '>
            <div className='flex flex-col min-w-fit'>
                <div
                    className="rounded-full w-10 h-10 loading" />
            </div>
            <div className='flex flex-col space-y-4 w-60'>
                <div className="flex items-center justify-center gap-2">
                    <div className="w-7/12 h-3 rounded-lg loading" />
                    <div className="w-5/12 h-3 rounded-lg loading" />

                </div>
                <div >
                    <div className="w-12/12 h-3 rounded-lg loading" />
                </div>
                <div className="flex gap-10 pt-3">
                    <div className="w-5 h-5 rounded-lg loading" />
                    <div className="w-5 h-5 rounded-lg loading" />
                    <div className="w-5 h-5 rounded-lg loading" />
                </div>
            </div>
        </div>
    )
}

export default FeedLoading