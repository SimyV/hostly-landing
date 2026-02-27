export interface ClientLogo {
  name: string
  src: string
}

const LOGO_ASSET_VERSION = 'v4'

export const logos: ClientLogo[] = [
  { name: 'NDIS', src: `/logos/ndis.png?${LOGO_ASSET_VERSION}` },
  { name: 'IOOF', src: `/logos/ioof.png?${LOGO_ASSET_VERSION}` },
  { name: 'Zurich', src: `/logos/zurich.png?${LOGO_ASSET_VERSION}` },
  { name: 'MLC', src: `/logos/mlc.png?${LOGO_ASSET_VERSION}` },
  { name: 'NAB', src: `/logos/nab.png?${LOGO_ASSET_VERSION}` },
  { name: 'Melbourne Business School', src: `/logos/mbs.png?${LOGO_ASSET_VERSION}` },
  { name: 'WorkSafe Tasmania', src: `/logos/worksafe.png?${LOGO_ASSET_VERSION}` },
  { name: 'Treasury Wine Estates', src: `/logos/twe.png?${LOGO_ASSET_VERSION}` },
  { name: 'Opticomm', src: `/logos/opticomm.png?${LOGO_ASSET_VERSION}` },
  { name: 'Dulux', src: `/logos/dulux.png?${LOGO_ASSET_VERSION}` },
  { name: 'Kmart', src: `/logos/kmart.svg?${LOGO_ASSET_VERSION}` },
  { name: 'Orica', src: `/logos/orica.png?${LOGO_ASSET_VERSION}` },
  { name: 'ANZ', src: `/logos/anz.png?${LOGO_ASSET_VERSION}` },
]
