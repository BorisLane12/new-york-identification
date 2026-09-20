/**
 * NYSIIS (New York State Identification and Intelligence System) phonetic code.
 *
 * This implementation follows the rules from the 1970 New York State
 * Identification and Intelligence System description, which are also used by
 * the U.S. Census Bureau for some record linkage work.
 *
 * The algorithm is designed for surnames and collapses common spelling
 * variants so that similar-sounding names map to the same code. It is not a
 * general-purpose phonetic key for arbitrary words.
 *
 * The code is intentionally conservative: only ASCII letters are processed.
 * Non-letter characters are ignored. This keeps the implementation predictable
 * for the census-style use case the algorithm was designed for.
 */

const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);

/**
 * Replace a terminal suffix if present.
 *
 * These mappings are applied before the main loop and are deliberately limited
 * to a small set. Applying too many suffix rules creates over-matching for
 * short names.
 */
function applyTerminalSuffix(name) {
  const upper = name.toUpperCase();

  if (upper.endsWith('EE') || upper.endsWith('IE')) {
    return upper.slice(0, -2) + 'Y';
  }
  if (upper.endsWith('DT') || upper.endsWith('RT') || upper.endsWith('RD')
      || upper.endsWith('NT') || upper.endsWith('ND')) {
    return upper.slice(0, -1);
  }
  return upper;
}

/**
 * Convert a single character using the NYSIIS replacement rules.
 *
 * @param {string} ch
 * @param {string} prev
 * @param {string} next
 * @returns {string}
 */
function convertChar(ch, prev, next) {
  if (ch === 'K') {
    return prev === 'C' ? '' : 'C';
  }

  if (ch === 'M') {
    return 'N';
  }

  if (ch === 'P') {
    return next === 'H' ? 'F' : 'P';
  }

  if (ch === 'H') {
    const isVowelAround =
      VOWELS.has(prev) && (next === undefined || VOWELS.has(next));
    return isVowelAround ? '' : 'H';
  }

  if (ch === 'W') {
    return VOWELS.has(prev) ? '' : 'W';
  }

  if (ch === 'Z') {
    return 'S';
  }

  if (ch === 'Q') {
    return 'G';
  }

  if (ch === 'S') {
    return next === 'C' && prev === 'H' ? 'S' : 'S';
  }

  if (ch === 'C') {
    return next === 'H' ? 'C' : 'C';
  }

  return ch;
}

/**
 * Remove duplicate consecutive characters, treating vowels as a single group.
 *
 * The original specification collapses consecutive vowels to one code
 * character. This implementation keeps the first vowel and drops the rest of
 * the vowel run.
 */
function collapseDuplicates(code) {
  let out = code[0] ?? '';
  for (let i = 1; i < code.length; i++) {
    const ch = code[i];
    const prev = out[out.length - 1];

    if (ch === prev) {
      continue;
    }

    const isPrevVowel = VOWELS.has(prev);
    const isChVowel = VOWELS.has(ch);

    if (isPrevVowel && isChVowel) {
      continue;
    }

    out += ch;
  }
  return out;
}

/**
 * Remove a trailing S unless the code is a single character.
 */
function dropTrailingS(code) {
  if (code.length > 1 && code.endsWith('S')) {
    return code.slice(0, -1);
  }
  return code;
}

/**
 * Remove a trailing AY unless the code is exactly 'AY'.
 */
function dropTrailingAY(code) {
  if (code.length > 2 && code.endsWith('AY')) {
    return code.slice(0, -2);
  }
  return code;
}

/**
 * Truncate or pad the code to exactly six characters.
 */
function padOrTruncate(code) {
  if (code.length > 6) {
    return code.slice(0, 6);
  }
  while (code.length < 6) {
    code += ' ';
  }
  return code;
}

/**
 * Compute the NYSIIS code for a name.
 *
 * @param {string} input - A name. Non-ASCII letters are ignored.
 * @returns {string} The six-character NYSIIS code, space padded on the right
 *   when the input produces a short code. Returns a six-space string for an
 *   empty or all-non-letter input.
 *
 * Why space padding? The original specification describes fixed-width codes,
 * and padding preserves deterministic sorting and comparison behaviour.
 */
export function nysiis(input) {
  if (typeof input !== 'string') {
    throw new TypeError('nysiis expects a string');
  }

  const letters = input
    .toUpperCase()
    .split('')
    .filter((ch) => ch >= 'A' && ch <= 'Z');

  if (letters.length === 0) {
    return '      ';
  }

  let name = applyTerminalSuffix(letters.join(''));

  let code = name[0];

  for (let i = 1; i < name.length; i++) {
    const prev = name[i - 1];
    const current = name[i];
    const next = i + 1 < name.length ? name[i + 1] : undefined;

    const converted = convertChar(current, prev, next);
    code += converted;
  }

  code = collapseDuplicates(code);
  code = dropTrailingS(code);
  code = dropTrailingAY(code);

  return padOrTruncate(code);
}

/**
 * Compute the NYSIIS code for a name, returning a trimmed string.
 *
 * This wrapper exists because callers often expect a compact code rather than
 * a fixed-width one.
 *
 * @param {string} input
 * @returns {string} The NYSIIS code without trailing padding spaces.
 */
export function NYSIIS(input) {
  return nysiis(input).trimEnd();
}
