import { useMutation } from '@apollo/client';
import { ConsiderationInputItem } from '@opensea/seaport-js/lib/types';
import { LensHubProxy } from 'abis/LensHubProxy';
import Button from 'components/UI/Button';
import Modal from 'components/UI/Modal';
import { Spinner } from 'components/UI/Spinner';
import { APP_NAME, LENSHUB_PROXY } from 'constants/constants';
import SeaportContext from 'contexts/seaport';
import { CreatePostBroadcastItemResult, EnabledModule, Nft } from 'generated/types';
import { BROADCAST_MUTATION } from 'graphql/mutation/broadcast-mutation';
import { CREATE_POST_TYPED_DATA_MUTATION } from 'graphql/mutation/create-post';
import { useContext, useState } from 'react';
import { useForm } from "react-hook-form";
import toast from 'react-hot-toast';
import { FiX } from 'react-icons/fi';
import { HiPlus } from 'react-icons/hi';
import { IoMdTrash } from 'react-icons/io';
import { useAppSelector } from 'state/hooks';
import { PublicationMainFocus, PublicationMetadata } from 'types/publication-metadata';
import getIPFSLink from 'utils/getIPFSLink';
import omit from 'utils/omit';
import splitSignature from 'utils/splitSignature';
import { uploadIpfs } from 'utils/uploadToIPFS';
import { v4 as uuid } from 'uuid';
import { useAccount, useContractWrite, useSignTypedData } from 'wagmi';
import AddCondition from './AddCondition';
import ConsiderationCard from './ConsiderationCard';
import SelectNFT, { trimAddress } from './SelectNFT';
import { ItemType } from '@opensea/seaport-js/lib/constants';
import { CreateOrderInput } from '@opensea/seaport-js/lib/types';
import { create } from 'domain';
type Props = {
    open: boolean;
    setOpen: (open: boolean) => void;
}

type FormValues = {
    name: string;
    description: string;
    category: string;
};
const CreateNFTPost = ({ open, setOpen }: Props) => {
    const currentUser = useAppSelector(state => state.user.currentUser)
    const { address } = useAccount()
    const { seaport } = useContext(SeaportContext)

    const [selectOpen, setSelectOpen] = useState<boolean>(false)
    const [selectedNFT, setSelectedNFT] = useState<Nft>()
    const [addConditionOpen, setAddConditionOpen] = useState<boolean>(false)
    const [currencySelected, setCurrenySelected] = useState<boolean>(false)
    const [postInput, setPostInput] = useState<string>("")
    const [considerations, setConsiderations] = useState<ConsiderationInputItem[]>([])
    const [createOrdering, setCreateOrdering] = useState(false)
    const { register, handleSubmit, getValues } = useForm<FormValues>();
    const [selectedModule, setSelectedModule] =
        useState<EnabledModule>()
    const [onlyFollowers, setOnlyFollowers] = useState<boolean>(false)

    const [isUploading, setIsUploading] = useState<boolean>(false)
    const { isLoading: signLoading, signTypedDataAsync } = useSignTypedData({
        onError(error) {
            toast.error(error?.message)
        }
    })
    const removeConsideration = (index: number) => {
        if ('amount' in considerations[index] && !('itemType' in considerations[index])) {
            setCurrenySelected(false)
        }
        setConsiderations(considerations.filter((_, i) => i !== index))
    }

    const { data,
        isLoading: writeLoading,
        write,
    } = useContractWrite(
        {
            addressOrName: LENSHUB_PROXY,
            contractInterface: LensHubProxy,
            functionName: 'postWithSig',
            mode: 'recklesslyUnprepared',
            onSuccess: async (data) => {
                const { wait, hash } = data
                setOpen(false)
                setPostInput("")
                toast.success('Successfully sent transaction: ' + hash)
                toast.promise(
                    wait(),
                    {
                        loading: 'Community creating...',
                        success: (data) => {
                            if (data.status) {
                                return `Community created successfully`
                            } else {
                                return `Community creation failed`
                            }
                        },
                        error: (err) => `This just happened: ${err.toString()}`,
                    }

                )

            },
            onError: (error) => {
                toast.error(error?.message)
            }
        })

    const [createPostTypedData, { loading: typedDataLoading }] = useMutation(
        CREATE_POST_TYPED_DATA_MUTATION, {
        onCompleted: async ({ createPostTypedData }: { createPostTypedData: CreatePostBroadcastItemResult }) => {
            const { id, typedData } = createPostTypedData
            const {
                profileId,
                contentURI,
                collectModule,
                collectModuleInitData,
                referenceModule,
                referenceModuleInitData,
                deadline
            } = typedData?.value

            try {
                const signature = await signTypedDataAsync({
                    domain: omit(typedData?.domain, '__typename'),
                    types: omit(typedData?.types, '__typename'),
                    value: omit(typedData?.value, '__typename')
                })
                const { v, r, s } = splitSignature(signature)
                const sig = { v, r, s, deadline }
                const inputStruct = {
                    profileId,
                    contentURI,
                    collectModule,
                    collectModuleInitData,
                    referenceModule,
                    referenceModuleInitData,
                    sig
                }
                const {
                    data: { broadcast: result }
                } = await broadcast({ variables: { request: { id, signature } } })
                console.log("broadcast result:", result)
                if ('reason' in result) write?.({ recklesslySetUnpreparedArgs: inputStruct })


            } catch (error) {
                console.warn('[Sign Error]', error)
            }

        },
        onError: (error) => {
            console.log(error)
            setIsUploading(false)

        }
    }
    )


    const [broadcast, { data: broadcastData, loading: broadcastLoading }] =
        useMutation(BROADCAST_MUTATION, {
            onCompleted: (data) => {
                console.log('broadcast completed', data)
            },
            onError(error) {
                // if (error.message === ERRORS.notMined) {
                //   toast.error(error.message)
                // }
                console.error('[Broadcast Error]', error)
            }
        })
    const handleCreate = async () => {
        if (!currentUser || !seaport) {
            toast.error("Please login first")
            return
        }

        const offer = {
            itemType: ItemType.ERC721,
            token: selectedNFT?.contractAddress,
            identifier: selectedNFT?.tokenId,
        }
        const orderParams: CreateOrderInput = {
            //@ts-ignore
            offer: [offer],

            consideration: considerations,
        }
        setCreateOrdering(true)
        const { executeAllActions } = await seaport?.createOrder(
            orderParams,
            address
        );
        try {
            const response = await executeAllActions();
            const { path: metaDataPath } = await uploadIpfs({
                order: response,
                offer: [{
                    ...offer,
                }],
                considerations: considerations,
            })
            console.log(metaDataPath)

            const publicationMetaData: PublicationMetadata = {
                version: '1.0.0',
                metadata_id: uuid(),
                description: postInput,//TODO: add trimify (figure out why)
                content: postInput,
                external_url: "",
                name: `[3card] NFT Post by @${currentUser?.handle}`,
                mainContentFocus: PublicationMainFocus.ARTICLE,
                attributes: [
                    {
                        traitType: 'string',
                        key: "type",
                        value: 'NFTPost'
                    },
                    {
                        traitType: 'string',
                        key: "metadata",
                        value: `ipfs://${metaDataPath}`
                    }
                ],
                createdAt: new Date(),
                appId: `${APP_NAME}`,
            }
            setIsUploading(true)
            const { path } = await uploadIpfs(publicationMetaData).finally(() => setIsUploading(false))
            createPostTypedData({
                variables: {
                    request: {
                        profileId: currentUser?.id,
                        contentURI: `https://ipfs.infura.io/ipfs/${path}`,
                        collectModule: {
                            freeCollectModule: {
                                followerOnly: false
                            }
                        },
                        referenceModule: {
                            followerOnlyReferenceModule: false
                        }
                    }
                }
            })
        }
        catch (error) {
            //@ts-ignore
            toast.error(error.message)
        } finally {
            setCreateOrdering(false)
        }




    }
    const onSubmit = handleSubmit(async (data) => {


    })
    const canSumbit = () => {
        if (!selectedNFT || !considerations.length) return false
        return true
    }
    const ButtonText = () => {
        if (createOrdering) return 'Creating Order'
        if (signLoading) return 'Signing'
        if (writeLoading) return "Confirming"
        if (isUploading) return "Uploading"
        return "Create"
    }
    console.log(selectedNFT)
    return (
        <Modal open={open} onClose={() => { setOpen(false) }} size='md'>
            <div className='flex flex-col gap-2'>
                <div className='flex justify-between items-center'>
                    <div className='text-[20px] font-bold'>
                        Create a NFT Post
                    </div>
                    <div onClick={() => { setOpen(false) }} className='inline-flex justify-center items-center w-8 h-8 rounded-full hover:bg-primary-blue hover:bg-opacity-30 hover:text-sky-400' >
                        <FiX className="text-[20px]" />
                    </div>
                </div>
                <div className='py-4 flex flex-col gap-2 '>
                    <div className='p-4 rounded-lg min-h-[120px]  max-h-[600px] overflow-y-auto h-fit justify-center items-center border border-border-gray' >
                        <div
                            contentEditable='true'
                            placeholder="Write something about your NFT..."
                            className=' w-full h-full bg-transparent border-none outline-none text-[20px] break-all'
                            onInput={(e) => setPostInput(e.currentTarget?.innerText)} />

                    </div>
                    {/* <div className='flex text-[20px] text-primary-blue items-center gap-[10px]'>
                        <RiImage2Line />
                        <AiOutlineFileGif />
                        <FaGlobeAsia />
                    </div> */}
                </div>
                <div className='flex flex-col py-2'>
                    <div className='flex justify-between items-center'>
                        <label>Select NFT</label>
                        {!selectedNFT &&
                            <div
                                className='inline-flex justify-center items-center w-8 h-8 rounded-full hover:bg-primary-blue hover:bg-opacity-30 hover:text-sky-400'
                                onClick={() => { setSelectOpen(true) }}>
                                <HiPlus className="text-[20px]" />
                            </div>}
                    </div>

                    {selectedNFT &&
                        <div onClick={() => { setSelectOpen(true) }}
                            className='mt-1 flex justify-between items-center py-2 px-3 border border-border-gray rounded-lg hover:cursor-pointer'>
                            <div
                                className="w-[100px] h-[100px] rounded-lg"
                                style={{
                                    backgroundImage: `url(${getIPFSLink(selectedNFT.originalContent.uri)})`,
                                    backgroundSize: "contain",
                                    backgroundPosition: "center center",
                                    backgroundRepeat: "no-repeat",
                                }} />
                            <div className='flex flex-col gap-2'>
                                <div>Contract: <span className='text-gray-400'>{trimAddress(selectedNFT?.contractAddress)}</span></div>
                                <div>Token ID: <span className='text-gray-400'>{selectedNFT?.tokenId}</span></div>
                                <div>Name: <span className='text-gray-400'>{selectedNFT?.name} </span></div>
                            </div>
                        </div>}

                </div>
                <div className='flex flex-col gap-2'>
                    <div className='flex justify-between items-center'>
                        <div >
                            Add selling condition
                        </div>


                        <div
                            className='inline-flex justify-center items-center w-8 h-8 rounded-full hover:bg-primary-blue hover:bg-opacity-30 hover:text-sky-400'
                            onClick={() => { setAddConditionOpen(true) }}>
                            <HiPlus className="text-[20px]" />
                        </div>
                    </div>
                    {considerations.map((consideration, index) => (
                        <div className='flex gap-2 items-center'>
                            <ConsiderationCard consideration={consideration} key={index} />
                            <div
                                className='inline-flex justify-center items-center w-8 h-8 rounded-full hover:bg-primary-blue hover:bg-opacity-30 hover:text-sky-400'
                                onClick={() => { removeConsideration(index) }}>
                                <IoMdTrash className="text-[20px]" />
                            </div>
                        </div>
                    ))}

                </div>


                <Button className='mt-4' type='submit'
                    disabled={
                        !canSumbit() ||
                        createOrdering ||
                        signLoading ||
                        typedDataLoading ||
                        broadcastLoading ||
                        isUploading}
                    icon={
                        (createOrdering
                            || isUploading
                            || writeLoading
                            || typedDataLoading
                            || signLoading)
                        && <Spinner size='sm' />}
                    onClick={handleCreate}>
                    {ButtonText()
                    }
                </Button>
            </div>
            <SelectNFT open={selectOpen} setOpen={setSelectOpen} setSelectedNFT={setSelectedNFT} />
            <AddCondition
                open={addConditionOpen}
                setOpen={setAddConditionOpen}
                considerations={considerations}
                setConsiderations={setConsiderations}
                currencySelected={currencySelected}
                setCurrenySelected={setCurrenySelected} />
        </Modal >
    )
}

export default CreateNFTPost