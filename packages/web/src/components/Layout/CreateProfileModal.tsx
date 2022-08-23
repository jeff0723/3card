import React, { Dispatch, Fragment, useState } from "react";
import styled from "styled-components";
import { Dialog, Transition } from "@headlessui/react";
import { FiX } from "react-icons/fi";
import { useForm } from "react-hook-form";
import ChooseFile from "components/UI/ChooseFile";
import { makeStorageClient } from "utils/web3-storage";
import { Spinner } from "components/UI/Spinner";
import toast from "react-hot-toast";
import Button from "components/UI/Button";
import { useMutation } from "@apollo/client";
import { CREATE_PROFILE_MUTATION } from "graphql/mutation/create-profile";
import Pending from "./Pending";
import { v4 as uuid } from 'uuid';
import { Mixpanel } from 'utils/Mixpanel';


type Props = {
    open: boolean;
    setOpen: Dispatch<boolean>;
};

const TextInput = styled.input`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px 16px;
  &:hover {
    border: 1px solid #1890ff;
  }
  &:focus-visible {
    outline: none !important;
    border: 1px solid #1890ff;
  }
`;
type FormValues = {
    handle: string;
};

const CreateProfileModal = ({ open, setOpen }: Props) => {
    const [uploading, setUploading] = useState(false);
    const [avatar, setAvatar] = useState("");
    const { register, handleSubmit, getValues, reset } = useForm<FormValues>();

    const [createProfile, { data, loading }] = useMutation(
        CREATE_PROFILE_MUTATION
    );
    const closeModal = () => {
        reset()
        setAvatar("")
        setOpen(false);

    };
    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        setUploading(true);
        if (e.target?.files) {
            try {
                // this part should be adjusted
                const client = makeStorageClient();
                const filename = uuid() + ".png"
                const file = new File([e.target.files[0]], filename)
                const cid = await client.put([file]);
                setAvatar(`https://ipfs.io/ipfs/${cid}/${filename}`);
            } finally {
                setUploading(false);
            }
        }
    };
    const onSubmit = () => {
        const { handle } = getValues();
        createProfile({
            variables: {
                request: {
                    handle: handle,
                    profilePictureUri: avatar ? avatar : ``,
                },
            },
            onCompleted: (data) => {
                console.log("create profile success: ", data);
                if (data?.createProfile?.reason == "HANDLE_TAKEN") {
                    toast.error("Handle taken! Please use another handle!");
                    return;
                }
                toast.success("Create profile transaction sent!");
                Mixpanel.track("publication.create_profile", { result: 'success' })

                closeModal();

            },
            onError: (error) => {
                toast.error(`create profile error: ${error}`);
                Mixpanel.track("publication.create_profile", { result: 'error' })

            },
        });
    };

    return (
        <>
            {data?.createProfile?.txHash && <Pending txHash={data?.createProfile?.txHash} />}
            <Transition appear show={open} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={closeModal}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-75" />
                    </Transition.Child>

                    <div className="fixed top-[50px] inset-x-0 overflow-y-auto">
                        <div className="flex items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="border border-white border-opacity-20 w-full max-w-md transform overflow-hidden rounded-2xl bg-black p-6 text-left align-middle shadow-xl transition-all">
                                    <div >
                                        <div className="flex justify-between items-center">
                                            <Dialog.Title
                                                as="h3"
                                                className="text-lg font-medium leading-6 text-white"
                                            >
                                                Create your profile
                                            </Dialog.Title>
                                            <button
                                                className="inline-flex justify-center items-center w-8 h-8 rounded-full hover:bg-primary-blue hover:bg-opacity-30 hover:text-sky-400"
                                                onClick={closeModal}
                                            >
                                                <FiX className="text-lg " />
                                            </button>
                                        </div>
                                        <div className="flex flex-col gap-4 mt-4">
                                            <div className="flex justify-start items-center gap-10">
                                                <div style={{ width: "50px" }}>
                                                    <label>handle: </label>
                                                </div>
                                                <TextInput
                                                    className="flex-1"
                                                    type="text"
                                                    placeholder="Type your handle without @"
                                                    {...register("handle", {
                                                        required: true,
                                                        maxLength: 20,
                                                    })}
                                                />
                                            </div>
                                            <div className="flex justify-start items-center gap-10">
                                                <div style={{ width: "50px" }}>
                                                    <label>avatar: </label>
                                                </div>
                                                <ChooseFile onChange={handleUpload} />
                                                {/* should refactor this info UI/components/Spinner */}
                                                {uploading && (
                                                    <div className="animate-spin rounded-full border-t-primary-blue border-black h-8 w-8 border-2" />
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <Button
                                                onClick={onSubmit}
                                                disabled={loading || uploading}
                                                // should refactor this info UI/components/Spinner
                                                icon={
                                                    loading && (
                                                        <div className="animate-spin rounded-full border-t-primary-blue border-black h-4 w-4 border-2" />
                                                    )
                                                }
                                            >
                                                Create
                                            </Button>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

        </>
    );
};

export default CreateProfileModal;
