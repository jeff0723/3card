import Link from 'next/link';
import { useRouter } from 'next/router'
import React from 'react'
import { xml } from 'xml'

type Props = {}
const xmlMap = new Map(Object.entries(xml));

const index = (props: Props) => {
  const router = useRouter()
  const { topic } = router.query

  return (
    <div>
      {
        xmlMap.get(topic as string)?.map((item) => (
          <div>
            <Link href={{
              pathname: `${topic}/${item.slug}`,
              query: {
                url: item.xmlUrl
              }
            }
            }>
              {item.title}
            </Link>
          </div>
        ))
      }</div>
  )
}


export default index