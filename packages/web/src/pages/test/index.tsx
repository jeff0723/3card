import WithMentionTextArea from 'components/UI/WithMentionTextArea'
import React, { useState } from 'react'

type Props = {}

const index = (props: Props) => {
    const [postInput, setPostInput] = useState("")

    return (
        <div className='w-full'>index
            <WithMentionTextArea postInput={postInput} setPostInput={setPostInput} placeholder="What's in your mind" />
        </div>
    )
}

export default index