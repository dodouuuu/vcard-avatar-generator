/**
 * E2E test script for vcard-avatar-generator core logic.
 * Tests VCF parsing, writing, and key utility functions.
 */
import { readFileSync } from 'fs'

import { Gender } from '../src/types.ts'
import { generateVcf } from '../src/utils/contact-writer.ts'
import { parseByVCard } from '../src/utils/reader/reader-vcard.ts'

let passed = 0
let failed = 0

/**
 *
 * @param condition
 * @param msg
 */
function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  ✅ ${msg}`)
    passed++
  } else {
    console.error(`  ❌ ${msg}`)
    failed++
  }
}

// ---- Test 1: Read test VCF ----
console.log('\n=== Test 1: Parse VCF file ===')
const vcfText = readFileSync('test-data/test-contacts.vcf', 'utf-8')
const contacts = parseByVCard(vcfText)

assert(contacts.length === 9, `Parsed ${contacts.length} contacts (expected 9)`)

// ---- Test 2: Check specific contacts ----
console.log('\n=== Test 2: Verify contact fields ===')

// 张三
const zhang = contacts[0]
assert(zhang.fn === '张三', `Contact 1 FN: "${zhang.fn}"`)
assert(zhang.familyName === '张', `Contact 1 familyName: "${zhang.familyName}"`)
assert(zhang.givenName === '三', `Contact 1 givenName: "${zhang.givenName}"`)
assert(zhang.gender === Gender.M, `Contact 1 gender: male`)
assert(zhang.org === '阿里巴巴', `Contact 1 org: "${zhang.org}"`)
assert(zhang.tel.length === 1, `Contact 1 has 1 phone`)
assert(zhang.tel[0].number === '13800138001', `Contact 1 phone: ${zhang.tel[0].number}`)
assert(zhang.tel[0].type === 'CELL', `Contact 1 phone type: CELL`)

// 王芳
const wang = contacts[2]
assert(wang.fn === '王芳', `Contact 3 FN: "${wang.fn}"`)
assert(wang.gender === Gender.F, `Contact 3 gender: female`)
assert(wang.org === '字节跳动', `Contact 3 org: "${wang.org}"`)

// 吴小明 (no gender, no org, HOME phone)
const wu = contacts[5]
assert(wu.fn === '吴小明', `Contact 6 FN: "${wu.fn}"`)
assert(wu.gender === Gender.U, `Contact 6 gender: unknown (default)`)
assert(wu.org === '', `Contact 6 org: empty`)
assert(wu.tel.length === 1, `Contact 6 has 1 phone`)
assert(wu.tel[0].type === 'HOME', `Contact 6 phone type: HOME`)

// AB Testing (English name)
const ab = contacts[6]
assert(ab.fn === 'AB Testing', `Contact 7 FN: "${ab.fn}"`)
assert(ab.familyName === 'Testing', `Contact 7 familyName: "${ab.familyName}"`)
assert(ab.givenName === 'AB', `Contact 7 givenName: "${ab.givenName}"`)

// 黄小婷 (no phone number)
const huang = contacts[8]
assert(huang.fn === '黄小婷', `Contact 9 FN: "${huang.fn}"`)
assert(huang.tel.length === 0, `Contact 9 has 0 phones`)
assert(huang.org === '网易', `Contact 9 org: "${huang.org}"`)
assert(huang.gender === Gender.F, `Contact 9 gender: female`)

// ---- Test 3: Generate VCF ----
console.log('\n=== Test 3: Generate VCF from contacts ===')
const generatedVcf = generateVcf(contacts)

assert(generatedVcf.includes('BEGIN:VCARD'), 'Generated VCF starts with BEGIN:VCARD')
assert(generatedVcf.includes('END:VCARD'), 'Generated VCF ends with END:VCARD')
assert(generatedVcf.includes('FN:张三'), 'Generated contains FN:张三')
assert(generatedVcf.includes('TEL;TYPE=CELL:13800138001'), 'Generated contains phone')
assert(generatedVcf.includes('GENDER:M'), 'Generated contains GENDER:M')
assert(generatedVcf.includes('GENDER:F'), 'Generated contains GENDER:F')

// Parse the generated VCF back to verify round-trip
const reParsed = parseByVCard(generatedVcf)
assert(
  reParsed.length === contacts.length,
  `Round-trip: ${reParsed.length} contacts (same as original)`,
)

// Check re-parsed data integrity
assert(reParsed[0].fn === '张三', 'Round-trip FN preserved')
assert(reParsed[0].tel[0].number === '13800138001', 'Round-trip phone preserved')

// ---- Test 4: Edge cases - empty contacts ----
console.log('\n=== Test 4: Edge cases ===')

// Empty VCF
const emptyResult = parseByVCard('')
assert(emptyResult.length === 0, 'Empty VCF returns 0 contacts')

// VCF with no real data (BEGIN/END only)
const minimalResult = parseByVCard('BEGIN:VCARD\nEND:VCARD')
assert(minimalResult.length === 0, 'Minimal VCF without name/phone returns 0 contacts')

// Multiple TEL types for one contact
const multiTel = parseByVCard(`BEGIN:VCARD
VERSION:3.0
FN:多号用户
N:多号;用户;;;
TEL;TYPE=CELL:13800000001
TEL;TYPE=WORK:010-88888888
TEL;TYPE=HOME:021-66666666
END:VCARD`)
assert(multiTel.length === 1, 'Multi-TEL parsed 1 contact')
assert(multiTel[0].tel.length === 3, 'Multi-TEL contact has 3 numbers')
assert(multiTel[0].tel[0].type === 'CELL', 'Multi-TEL #1 type: CELL')
assert(multiTel[0].tel[1].type === 'WORK', 'Multi-TEL #2 type: WORK')
assert(multiTel[0].tel[2].type === 'HOME', 'Multi-TEL #3 type: HOME')

// ---- Summary ----
console.log(`\n=========`)
console.log(`Passed: ${passed}`)
console.log(`Failed: ${failed}`)
if (failed > 0) {
  process.exit(1)
}
