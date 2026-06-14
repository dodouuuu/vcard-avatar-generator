import { type Contact, Gender } from '../types'
import { guessGender } from './chinese-gender-guesser'
import { parseByVCard } from './reader/reader-vcard'
import { parseByXlsx } from './reader/reader-xlsx'

/**
 * Supported file extensions for contact import.
 */
const SUPPORTED_EXTENSIONS = ['.vcf', '.xlsx'] as const

/**
 * Reads a contact file (.vcf or .xlsx) and returns parsed contacts.
 * Infers gender from given names when the source data does not provide it.
 *
 * @param file - The uploaded File object.
 * @returns An array of parsed Contact objects.
 * @throws If the file type is unsupported.
 */
export async function readContact(file: File): Promise<Contact[]> {
  const ext = getExtension(file.name)

  if (ext === '.vcf') {
    const text = await file.text()
    const contacts = parseByVCard(text)
    return fillGender(contacts)
  }

  if (ext === '.xlsx') {
    const data = await file.arrayBuffer()
    const contacts = parseByXlsx(data)
    return fillGender(contacts)
  }

  throw new Error(`不支持的文件格式: ${ext}，仅支持 ${SUPPORTED_EXTENSIONS.join(', ')}`)
}

/**
 * Extracts the lowercased file extension from a file name.
 *
 * @param name - The file name.
 * @returns The file extension including the dot (e.g. ".vcf").
 */
function getExtension(name: string): string {
  const idx = name.lastIndexOf('.')
  return idx !== -1 ? name.slice(idx).toLowerCase() : ''
}

/**
 * Fills missing gender fields by guessing from the given name.
 *
 * @param contacts - The contacts to process.
 * @returns A new array with gender fields populated.
 */
function fillGender(contacts: Contact[]): Contact[] {
  return contacts.map((c) => ({
    ...c,
    gender: c.gender !== Gender.U ? c.gender : guessGender(c.givenName || c.fn),
  }))
}
