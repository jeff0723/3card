import React, { Dispatch } from 'react'
import { TabType } from '.'
import clsx from 'clsx'
interface Props {
    setCurrentTab: Dispatch<string>
    currentTab: string
}

const ProfileTabs = ({ setCurrentTab, currentTab }: Props) => {

    return (
        <div className='flex gap-[24px] text-[16px] px-4 py-2'>
            {Object.keys(TabType).map((tab, index) => (
                <button
                    key={index}
                    className={clsx(
                        {
                            'border-b-[2px] border-primary-blue': currentTab === tab,
                        },

                    )}
                    onClick={() => {
                        console.log(tab)
                        console.log(currentTab)
                        console.log(currentTab === tab)
                        setCurrentTab(tab)
                    }}>{tab.charAt(0) + tab.toLowerCase().slice(1)}</button>
            ))}
        </div>
    )
}

export default ProfileTabs