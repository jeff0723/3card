import React from 'react'
import type { NextPage } from 'next'
import Sidebar from 'components/Message/Sidebar'
import Button from 'components/UI/Button'

type Props = {}

const index: NextPage = (props: Props) => {
    return (
        <Sidebar >
            <div className='w-full flex justify-center items-center'>
                <div className='flex flex-col gap-4 w-[300px]'>
                    <div>
                        <div className='font-bold text-[32px]'>Select a message</div>
                        <p className='text-gray-400 text-[15px]'>Choose from your existing conversations, or start a new one.</p>
                    </div>
                    <div>
                        <Button> New Message</Button>
                    </div>
                </div>
            </div>
        </Sidebar>
    )
}

export default index