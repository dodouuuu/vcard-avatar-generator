/**
 * Advertisement configuration for the upload page.
 * Left and right sidebars each display up to 3 ad slots.
 * Set an entry to null to leave the slot empty.
 */

export interface Ad {
  /** Image URL to display. */
  img: string
  /** Link URL when clicked. */
  link: string
  /** Alt text for the image. */
  alt: string
}

export interface AdConfig {
  left: (Ad | null)[]
  right: (Ad | null)[]
}

export const adConfig: AdConfig = {
  left: [
    {
      img: '/vcard-avatar-generator/ad-placeholder.svg',
      link: '#',
      alt: '广告位',
    },
    {
      img: '/vcard-avatar-generator/ad-placeholder.svg',
      link: '#',
      alt: '广告位',
    },
  ],
  right: [
    {
      img: '/vcard-avatar-generator/ad-placeholder.svg',
      link: '#',
      alt: '广告位',
    },
    {
      img: '/vcard-avatar-generator/ad-placeholder.svg',
      link: '#',
      alt: '广告位',
    },
  ],
}
