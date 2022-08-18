import { Seaport } from '@opensea/seaport-js'
import { createContext } from 'react'

export interface SeaportContextType {
    seaport: Seaport | undefined
}

const SeaportContext = createContext<SeaportContextType>({
    seaport: undefined,
})

export default SeaportContext