/**
 * A phone number entry with its type label (maps to vCard TEL).
 */
export interface Tel {
  /** Type label, e.g. "CELL", "HOME", "WORK". */
  type: string
  /** The phone number string. */
  number: string
}

/** Gender: M (male), F (female), U (unknown) — maps to vCard GENDER. */
export enum Gender {
  M,
  F,
  U,
}

/**
 * Represents a parsed contact with fields aligned to vCard standard properties.
 */
export interface Contact {
  /** vCard FN — formatted / full name. */
  fn: string
  /** vCard N — family name. */
  familyName: string
  /** vCard N — given name. */
  givenName: string
  /** vCard GENDER. */
  gender: Gender
  /** vCard ORG — organization / company. */
  org: string
  /** vCard TEL — phone numbers (supports multiple types). */
  tel: Tel[]
  /** vCard PHOTO — avatar image encoded as a base64 data URI. */
  photo: string
}
