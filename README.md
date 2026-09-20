# New York Identification

Computes the New York State Identification and Intelligence System (NYSIIS) phonetic code for matching person names.

```js
import { nysiis, NYSIIS } from 'new-york-identification';

nysiis('Martin');   // 'NARTAN'
NYSIIS('Williams'); // 'WALAN'
```

`nysiis` returns a fixed-width six-character code, space padded on the right. `NYSIIS` returns the same code without trailing padding spaces.

## Why this exists

NYSIIS is a phonetic matching algorithm designed for surnames in record linkage. It handles common spelling variations better than Soundex while remaining simple enough to implement without dependencies. The trade-off made here is to follow the original 1970 specification closely, including fixed-width output, rather than a modern variant that drops padding.

## Edge cases

Non-letter characters are ignored. Empty input produces six spaces. Trailing S and AY are dropped unless the code would become empty. Names longer than six characters are truncated to the first six code characters.
