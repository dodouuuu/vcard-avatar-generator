/**
 * Promo card configuration for page sidebars.
 * Indexes 0–1 render on the left, indexes 2+ render on the right.
 */

export interface SpotCard {
  /** Card image URL. */
  img: string
  /** Link URL when clicked. */
  link: string
  /** Alt text for the image. */
  alt: string
}

export const spotCardConfig: SpotCard[] = [
  {
    img: `${import.meta.env.BASE_URL}promo-placeholder.svg`,
    link: '#',
    alt: '展位',
  },
  {
    img: `${import.meta.env.BASE_URL}promo-placeholder.svg`,
    link: '#',
    alt: '展位',
  },
  {
    img: `${import.meta.env.BASE_URL}promo-placeholder.svg`,
    link: '#',
    alt: '展位',
  },
  {
    img: `${import.meta.env.BASE_URL}promo-placeholder.svg`,
    link: '#',
    alt: '展位',
  },
]
