import { Dialog, Transition } from "@headlessui/react";
import Button from "components/UI/Button";
import ChooseFile from "components/UI/ChooseFile";
import { Fragment } from "react";
import { FiX } from "react-icons/fi";
import { ReactNode } from 'react'
import clsx from 'clsx'
type Props = {
    children: ReactNode;
    open: boolean;
    onClose: () => void;
    size?: 'md' | 'lg'
}

const Modal = ({ open, onClose, children, size = "md" }: Props) => {
    return (
        <Transition appear show={open} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-white bg-opacity-30" />
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
                            <Dialog.Panel
                                className={
                                    clsx(
                                        { "max-w-lg": size == 'lg' },
                                        { "max-w-md": size == 'md' },
                                        "border border-white border-opacity-20 w-full transform overflow-hidden rounded-2xl bg-black p-4 text-left align-middle shadow-xl transition-all"
                                    )
                                }
                            >
                                {children}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}

export default Modal