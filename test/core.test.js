import { test } from 'node:test';
import assert from 'node:assert/strict';

import { nysiis, NYSIIS } from '../src/index.js';

test('exports both functions', () => {
  assert.equal(typeof nysiis, 'function');
  assert.equal(typeof NYSIIS, 'function');
});

test('empty string returns six spaces', () => {
  assert.equal(nysiis(''), '      ');
});

test('non-letter input returns six spaces', () => {
  assert.equal(nysiis('123!'), '      ');
});

test('single letter is padded to six characters', () => {
  assert.equal(nysiis('A'), 'A     ');
});

test('basic surname maps correctly', () => {
  assert.equal(nysiis('Martin'), 'MARTIN');
});

test('K after C is dropped', () => {
  assert.equal(nysiis('Ck'), 'C     ');
});

test('terminal suffix DT becomes D', () => {
  assert.equal(nysiis('Brodt'), 'BROD  ');
});

test('terminal suffix IE becomes Y', () => {
  assert.equal(nysiis('Bowie'), 'BOY   ');
});

test('terminal suffix EE becomes Y', () => {
  assert.equal(nysiis('Lee'), 'LY    ');
});

test('PH becomes F', () => {
  assert.equal(nysiis('Philip'), 'PHILIP');
});

test('vowel run collapses to one vowel', () => {
  assert.equal(nysiis('McDaniel'), 'MCDANI');
});

test('trailing S is dropped', () => {
  assert.equal(nysiis('Williams'), 'WILIN ');
});

test('trailing AY is dropped', () => {
  assert.equal(nysiis('Kay'), 'K     ');
});

test('NYSIIS wrapper trims padding', () => {
  assert.equal(NYSIIS('A'), 'A');
});

test('type error on non-string', () => {
  assert.throws(() => nysiis(null), TypeError);
});
