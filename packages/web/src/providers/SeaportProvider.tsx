import { Seaport } from '@opensea/seaport-js'
import SeaportContext, { SeaportContextType } from 'contexts/seaport'
import React, { useEffect, useState } from 'react'
import { useAccount, useSigner } from 'wagmi'

type Props = {
    children?: React.ReactNode
}

const SeaportProvider = ({ children }: Props) => {
    const { connector: activeConnector, isConnected } = useAccount()
    const { data: signer } = useSigner() as { data: any }
    const [seaport, setSeaport] = useState<Seaport>()
    const [providerState, setProviderState] = useState<SeaportContextType>({
        seaport
    })

    // const init = async () => {
    //     if (isConnected) {
    //         const signer = await activeConnector?.getSigner()
    //         if (signer) {
    //             const _seaport = new Seaport(signer);
    //             setSeaport(_seaport)
    //         }

    //     }
    // }
    const init = () => {
        if (signer) {
            const _seaport = new Seaport(signer);
            setSeaport(_seaport)
        }
    }
    useEffect(() => {
        init()
    }, [signer])

    useEffect(() => {
        setProviderState({
            seaport
        })
    }, [seaport])

    return (
        <SeaportContext.Provider value={providerState}>
            {children}
        </SeaportContext.Provider>
    )
}

export default SeaportProvider