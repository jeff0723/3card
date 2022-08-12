import Modal from 'components/UI/Modal';
import React, { useState } from 'react'
import { FiX } from 'react-icons/fi';
import { useAppSelector } from 'state/hooks';
import { RiImage2Line } from 'react-icons/ri'
import { FaGlobeAsia } from 'react-icons/fa'
import { AiOutlineFileGif } from 'react-icons/ai'
import { BiCommentDetail } from 'react-icons/bi'
import Button from 'components/UI/Button';
import styled from 'styled-components';
type Props = {
    open: boolean;
    setOpen: (open: boolean) => void;
}

const TextArea = styled.div`
    [contenteditable="true"]:empty::before{
        content: "What's in your mind";
        color: gray;
    }
`

const CreatePost = ({ open, setOpen }: Props) => {

    const currentUser = useAppSelector(state => state.user.currentUser)
    const [postInput, setPostInput] = useState("")
    return (
        <Modal open={open} onClose={() => { setOpen(false) }} size={'lg'}>
            <div className='flex flex-col gap-2'>
                <div className='flex justify-end'>
                    <div onClick={() => { setOpen(false) }} className='inline-flex justify-center items-center w-8 h-8 rounded-full hover:bg-primary-blue hover:bg-opacity-30 hover:text-sky-400' >
                        <FiX className="text-[20px] " />
                    </div>
                </div>
                <div className="flex gap-4">
                    <div>
                        <img src={currentUser?.picture?.original.url} alt="" className="w-10 h-10 rounded-full" />
                    </div>
                    <div className='flex flex-col w-full gap-2 '>
                        <div className='min-h-[90px]  max-h-[600px] overflow-y-scroll h-fit justify-center items-center ' >
                            <div contentEditable='true' placeholder="What's in your mind" className=' w-full h-full bg-transparent border-none outline-none text-[20px] break-all' />


                        </div>
                        <div className='border-b border-border-gray' />
                        <div className='flex justify-between items-center'>
                            <div className='flex text-[20px] text-primary-blue items-center gap-[10px]'>
                                <RiImage2Line />
                                <AiOutlineFileGif />
                                <FaGlobeAsia />
                            </div>
                            <Button className='w-15'>Post</Button>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default CreatePost