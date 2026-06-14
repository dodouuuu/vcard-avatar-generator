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
      img: 'https://inews.gtimg.com/om_bt/Opc4Yf6d2RRdhQM0dGm7LAHxdWGSsrCV_qGrQI1Sr7Y3wAA/1000',
      link: 'https://baidu.com',
      alt: 'Ad 1',
    },
    {
      img: 'https://inews.gtimg.com/om_bt/Opc4Yf6d2RRdhQM0dGm7LAHxdWGSsrCV_qGrQI1Sr7Y3wAA/1000',
      link: 'https://baidu.com',
      alt: 'Ad 1',
    },
  ],
  right: [
    {
      img: 'https://inews.gtimg.com/om_bt/Opc4Yf6d2RRdhQM0dGm7LAHxdWGSsrCV_qGrQI1Sr7Y3wAA/1000',
      link: 'https://baidu.com',
      alt: 'Ad 1',
    },
    {
      img: 'https://inews.gtimg.com/om_bt/Opc4Yf6d2RRdhQM0dGm7LAHxdWGSsrCV_qGrQI1Sr7Y3wAA/1000',
      link: 'https://baidu.com',
      alt: 'Ad 1',
    },
  ],
}
