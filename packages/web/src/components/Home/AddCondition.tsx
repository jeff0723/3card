import ListBox from 'components/UI/ListBox';
import Modal from 'components/UI/Modal';
import React, { useState } from 'react'
import { FiX } from 'react-icons/fi';
import { ItemType } from '@opensea/seaport-js/lib/constants';
import Button from 'components/UI/Button';
import { ConsiderationInputItem } from '@opensea/seaport-js/lib/types';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { ethers } from 'ethers';

type Props = {
    open: boolean;
    setOpen: (open: boolean) => void;
    considerations: ConsiderationInputItem[];
    setConsiderations: (considerations: ConsiderationInputItem[]) => void;
    currencySelected: boolean;
    setCurrenySelected: (currencySelected: boolean) => void;
}
const options = [
    "NATIVE",
    "ERC721",
    "ERC1155",
    "ERC20"
]
const nftOnlyOptions = [
    "ERC721",
    "ERC1155"
]
type FormValues = {
    token: string;
    identifier: string;
    amount: string;
};
const AddCondition = ({ open, setOpen, considerations, setConsiderations, currencySelected, setCurrenySelected }: Props) => {

    const [selected, setSelected] = useState<string>('ERC721')
    const { register, getValues, reset } = useForm<FormValues>();
    const handleAddConsiderations = () => {
        const { token, identifier, amount } = getValues()

        if (!token) {
            if (selected !== 'NATIVE') {
                toast.error("Please fill in address!")
                return
            }
        }
        if ((selected === 'ERC721' || selected === 'ERC1155') && !identifier) {
            toast.error("Please fill in id!")
            return
        }
        if (selected !== 'ERC721' && !amount) {
            toast.error("Please fill in amount!")
            return
        }


        let consideration: ConsiderationInputItem;
        switch (selected) {
            case 'ERC721':
                consideration = {
                    itemType: ItemType.ERC721,
                    token: token,
                    identifier: identifier,
                }
                setConsiderations([...considerations, consideration])

                break
            case 'ERC1155':
                consideration = {
                    itemType: ItemType.ERC1155,
                    token: token,
                    identifier: identifier,
                    amount: amount,
                }
                setConsiderations([...considerations, consideration])

                break
            case 'ERC20':
                //this should parse with decimal
                consideration = {
                    token: token,
                    amount: amount,
                }
                setCurrenySelected(true)
                setConsiderations([...considerations, consideration])

                break
            case 'NATIVE':
                consideration = {
                    amount: ethers.utils.parseEther(amount.toString()).toString(),
                }
                setCurrenySelected(true)
                setConsiderations([...considerations, consideration])

                break
        }
        setOpen(false)
        setSelected('ERC721')
        reset()
    }
    return (
        <Modal open={open} onClose={() => { setOpen(false) }} size='md'>
            <div className='flex flex-col gap-4 h-[500px]'>
                <div className="flex justify-between items-center">
                    <div className='flex gap-4'>
                        <div onClick={() => { setOpen(false) }} className='inline-flex justify-center items-center w-8 h-8 rounded-full hover:bg-primary-blue hover:bg-opacity-30 hover:text-sky-400' >
                            <FiX className="text-[20px] " />
                        </div>
                        <div className="text-[20px] font-bold">
                            Add Condition
                        </div>

                    </div>


                    <Button onClick={handleAddConsiderations}>Save</Button>
                </div>
                <form className='flex flex-col gap-4'>
                    <div className='flex gap-2 items-center'>
                        <div className='w-40'>Token Type: </div>
                        <div className='w-full'>
                            <ListBox options={currencySelected ? nftOnlyOptions : options} selected={selected} setSelected={setSelected} />
                        </div>
                    </div>
                    {selected !== 'NATIVE' &&
                        <div className='flex gap-2 items-center'>
                            <div className='w-40'>Token Address: </div>
                            <input
                                type='text'
                                placeholder='Address'
                                className='w-full p-4 bg-black rounded-lg border border-border-gray focus:outline-primary-blue'
                                {...register('token')} />

                        </div>}

                    {(selected === 'ERC721' || selected === 'ERC1155') &&
                        <div className='flex gap-2 items-center'>
                            <div className='w-40'>Token ID: </div>
                            <input
                                type='number'
                                placeholder='ID'
                                className='w-full p-4 bg-black rounded-lg border border-border-gray focus:outline-primary-blue'
                                {...register('identifier')} />
                        </div>
                    }
                    {selected !== 'ERC721' &&

                        <div className='flex gap-2 items-center'>
                            <div className='w-40'>Amount: </div>
                            <input
                                type='number'
                                placeholder='Amount'
                                className='w-full p-4 bg-black rounded-lg border border-border-gray focus:outline-primary-blue'
                                {...register('amount', { valueAsNumber: true })} />

                        </div>
                    }
                </form>
            </div>
        </Modal>
    )
}

export default AddCondition