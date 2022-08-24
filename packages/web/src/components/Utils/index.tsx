import React, { FC, HTMLProps } from 'react'

// function handleClickExternalLink(event: React.MouseEvent<HTMLAnchorElement>) {
//     const { target, href } = event.currentTarget

//     const anonymizedHref = anonymizeLink(href)

//     // don't prevent default, don't redirect if it's a new tab
//     if (target === '_blank' || event.ctrlKey || event.metaKey) {
//       ReactGA.outboundLink({ label: anonymizedHref }, () => {
//         console.debug('Fired outbound link event', anonymizedHref)
//       })
//     } else {
//       event.preventDefault()
//       // send a ReactGA event and then trigger a location change
//       ReactGA.outboundLink({ label: anonymizedHref }, () => {
//         window.location.href = anonymizedHref
//       })
//     }
//   }
export function ExternalLink({
    target = '_blank',
    href,
    rel = 'noopener noreferrer',
    children,
    ...rest
}: Omit<HTMLProps<HTMLAnchorElement>, 'as' | 'ref' | 'onClick'> & { href: string }) {
    return (<a target={target} rel={rel} href={href}  {...rest}>
        {children}
    </a>)
}