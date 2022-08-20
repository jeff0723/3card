import { Maybe } from 'generated/types'

type Attribute = {
    key: string
    value: string
}

type Query =
    | 'app'
    | 'twitter'
    | 'location'
    | 'website'
    | 'type'

const getAttribute = (
    attributes: Maybe<Attribute[]> | undefined,
    query: Query
): string => {
    return attributes?.find((o) => o.key === query)?.value || ''
}

export default getAttribute
