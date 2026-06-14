import { type Contact, Gender } from '../types'

/**
 * Generates vCard 3.0 text content from an array of contacts.
 *
 * @param contacts - The contacts to serialize.
 * @returns The complete .vcf file content as a string.
 */
export function generateVcf(contacts: Contact[]): string {
  return contacts.map(generateVCardEntry).join('\n')
}

/**
 * Builds a single vCard 3.0 entry string from a Contact object.
 *
 * @param contact - The contact to serialize.
 * @returns A complete vCard 3.0 entry as a string.
 */
function generateVCardEntry(contact: Contact): string {
  const lines: string[] = ['BEGIN:VCARD', 'VERSION:3.0']

  // N and FN
  const n = `${escapeValue(contact.familyName)};${escapeValue(contact.givenName)};;;`
  lines.push(`N:${n}`)
  lines.push(`FN:${escapeValue(contact.fn || 'Unknown')}`)

  // Gender
  if (contact.gender === Gender.M) {
    lines.push('GENDER:M')
  } else if (contact.gender === Gender.F) {
    lines.push('GENDER:F')
  }

  // Organization
  if (contact.org) {
    lines.push(`ORG:${escapeValue(contact.org)}`)
  }

  // Phone numbers
  for (const phone of contact.tel) {
    lines.push(`TEL;TYPE=${phone.type}:${phone.number}`)
  }

  // Avatar (base64 encoded)
  if (contact.photo) {
    const base64 = stripDataUri(contact.photo)
    if (base64) {
      lines.push(`PHOTO;ENCODING=BASE64;TYPE=PNG:`)
      // Split base64 into 76-char lines per vCard spec
      for (let i = 0; i < base64.length; i += 76) {
        lines.push(base64.slice(i, i + 76))
      }
    }
  }

  lines.push('END:VCARD')
  return lines.join('\r\n')
}

/**
 * Escapes special characters in a vCard value.
 *
 * @param value - The raw string to escape.
 * @returns The escaped string safe for vCard serialization.
 */
function escapeValue(value: string): string {
  return value.replace(/[\\;,]/g, (char) => `\\${char}`)
}

/**
 * Strips the data URI prefix from a base64 avatar string.
 *
 * @param avatar - The data URI string (e.g. "data:image/png;base64,...").
 * @returns The raw base64 content without the prefix.
 */
function stripDataUri(avatar: string): string {
  const idx = avatar.indexOf(',')
  return idx !== -1 ? avatar.slice(idx + 1) : avatar
}
