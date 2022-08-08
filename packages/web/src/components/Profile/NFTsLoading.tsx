import React from 'react'
import NFTLoading from './NFTLoading'

type Props = {}

const NFTsLoading = (props: Props) => {
  return (
    <div className="grid gap-4 grid-cols-2">
      <NFTLoading />
      <NFTLoading />
      <NFTLoading />
      <NFTLoading />
    </div>
  )
}

export default NFTsLoading