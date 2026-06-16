import ICAL from 'ical.js'

import { type Contact, Gender } from '../../types'

/**
 * Parses the text content of a .vcf file using ical.js and returns contacts.
 *
 * The raw vCard text is first parsed into jCal format (JSON representation of
 * iCalendar/vCard data) via ICAL.parse, then each "vcard" component is
 * extracted and converted into a Contact object.
 *
 * Supports vCard 2.1, 3.0, and 4.0 formats.
 *
 * @param text - The raw text content of a .vcf file.
 * @returns An array of parsed Contact objects.
 */
export function parseByVCard(text: string): Contact[] {
  const jcalData = ICAL.parse(text)

  // ICAL.parse returns either a single component (["vcard", ...]) or an array
  // of components when the file contains multiple vCards. Normalise both cases
  // into an array so we can iterate uniformly.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ICAL.parse returns any[]
  const components: any[][] = typeof jcalData[0] === 'string' ? [jcalData] : jcalData

  const contacts: Contact[] = []

  for (const jcal of components) {
    if (jcal[0] !== 'vcard') {
      continue
    }
    const comp = new ICAL.Component(jcal)

    const contact = parseComponent(comp)
    if (contact) {
      contacts.push(contact)
    }
  }

  return contacts
}

/**
 * Converts a single ical.js vCard component into a Contact object.
 *
 * Each relevant vCard property (FN, N, TEL, ORG, GENDER, PHOTO) is read from
 * the component and mapped onto the corresponding Contact field. Missing
 * properties are left at their default values (empty string, Gender.U, etc.).
 *
 * @param comp - The ical.js vCard component to parse.
 * @returns A parsed Contact object, or null if the vCard contains no usable data.
 */
function parseComponent(comp: ICAL.Component): Contact | null {
  const contact: Contact = {
    fn: '',
    familyName: '',
    givenName: '',
    gender: Gender.U,
    org: '',
    tel: [],
    photo: '',
  }

  // --- FN (Formatted Name) ---
  // The display-ready full name of the contact. This is the preferred name to
  // show in UIs when the structured N property is unavailable.
  const fnValue = comp.getFirstPropertyValue('fn')
  if (fnValue) {
    contact.fn = String(fnValue)
  }

  // --- N (Structured Name) ---
  // A structured representation of the name split into components. The first
  // element is the family name and the second is the given name.
  const nProp = comp.getFirstProperty('n')
  if (nProp) {
    const nValue = nProp.getFirstValue()
    // vCard N value is an array: [familyName, givenName, middleName, prefix, suffix]
    if (Array.isArray(nValue)) {
      contact.familyName = nValue[0] ?? ''
      contact.givenName = nValue[1] ?? ''
    }
  }

  // If N is absent, fall back to using FN as the family name so that at least
  // one name field is populated for display purposes.
  if (!contact.familyName && !contact.givenName) {
    if (contact.fn) {
      contact.familyName = contact.fn
    }
  }

  // If FN is absent, reconstruct it from the structured name parts as a
  // fallback so callers always have a non-empty fn value.
  if (!contact.fn) {
    const nameParts = [contact.familyName, contact.givenName].filter(Boolean)
    contact.fn = nameParts.join(' ') || 'Unknown'
  }

  // --- TEL (Telephone Numbers) ---
  // vCards can contain multiple TEL properties, each with an optional TYPE
  // parameter (e.g. "CELL", "HOME", "WORK"). We store all numbers, preserving
  // the TYPE if present. When no TYPE is declared, we infer it from the number
  // format: Chinese mobile numbers (1xx-xxxxxxxx, 11 digits) are tagged as
  // CELL, and everything else defaults to WORK.
  const telProps = comp.getAllProperties('tel')
  for (const telProp of telProps) {
    const number = String(telProp.getFirstValue()).replace(/[\s-]/g, '')
    if (!number) {
      continue
    }

    const typeParam = telProp.getParameter('type')
    const types = typeParam ? (Array.isArray(typeParam) ? typeParam : [typeParam]) : []

    const type =
      types.length > 0 ? types[0]!.toUpperCase() : /^1\d{10}$/.test(number) ? 'CELL' : 'WORK'

    contact.tel.push({
      type,
      number,
    })
  }

  // --- ORG (Organization) ---
  // The organisation or company the contact belongs to. The value may be a
  // single string or an array of hierarchical levels (e.g.
  // ["Company", "Department"]); we only take the top-level entry.
  const orgValue = comp.getFirstPropertyValue('org')
  if (orgValue) {
    const orgParts = Array.isArray(orgValue) ? orgValue : String(orgValue)
    contact.org = Array.isArray(orgParts) ? (orgParts[0] ?? '') : String(orgParts)
  }

  // --- GENDER ---
  // vCard 4.0 supports an explicit GENDER property with values "M" (male),
  // "F" (female) or other values. We map "M" and "F" to our Gender enum and
  // leave Gender.U (unknown) as the default for everything else.
  const genderValue = comp.getFirstPropertyValue('gender')
  if (genderValue) {
    const raw = String(genderValue).toUpperCase()
    if (raw.startsWith('M')) {
      contact.gender = Gender.M
    } else if (raw.startsWith('F')) {
      contact.gender = Gender.F
    }
  }

  // --- PHOTO (Avatar Image) ---
  // The PHOTO property may contain either:
  //   1. Base64-encoded image data (vCard 3.0, ENCODING=b), or
  //   2. A data URI or URL (vCard 4.0, inline).
  // We convert both cases into a data:image/png;base64,... URI for consistent
  // use in <img> tags or <canvas> elements.
  const photoProp = comp.getFirstProperty('photo')
  if (photoProp) {
    const encoding = String(photoProp.getParameter('encoding') ?? '')
    const value = photoProp.getFirstValue()
    if (encoding?.toUpperCase() === 'B' && value) {
      contact.photo = `data:image/png;base64,${value}`
    } else if (value) {
      // Inline URI (data:image/...)
      contact.photo = String(value)
    }
  }

  // Skip entries that contain no real contact data (no name and no phone
  // numbers), which can happen with malformed or empty vCards.
  if (!contact.familyName && !contact.givenName && contact.tel.length === 0) {
    return null
  }

  return contact
}
