const getIPFSLink = (hash: string): string => {
    if (!hash) return ""
    const infuraIPFS = 'https://ipfs.io/ipfs/'

    return hash
        .replace(/^Qm[1-9A-Za-z]{44}/gm, `${infuraIPFS}${hash}`)
        .replace('ipfs://', infuraIPFS)
}

export default getIPFSLink
