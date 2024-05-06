import { encodeString } from '../querystring-helpers';

describe('encoding querystring helpers', () => {
  test('escapes ES reserved characters', () => {
    const result = encodeString('test[query]');
    expect(result).toEqual('test\\[query\\]');
  });

  test('Does not escape colons if preceeded by metadata field', () => {
    const result = encodeString('name:query');
    expect(result).toEqual('name:query');
  });

  test('Does escape colons if not preceeded by metadata field', () => {
    const result = encodeString('test:query');
    expect(result).toEqual('test\\:query');
  });

  test('Does not escape symbols if already escaped', () => {
    const escaped_string_colon = encodeString('test\\:query');
    expect(escaped_string_colon).toEqual('test\\:query');

    const escaped_string_brackets = encodeString('test\\[query\\]');
    expect(escaped_string_brackets).toEqual('test\\[query\\]');
  });
  // works with fields that have symbols

  test('Does not escape colons if preceeded by existing metadata field with symbols', () => {
    const queryWithId = encodeString('_id:query');
    expect(queryWithId).toEqual('_id:query');

    const queryWithType = encodeString('@type:query');
    expect(queryWithType).toEqual('@type:query');

    const queryWithSource = encodeString('includedInDataCatalog.name:query');
    expect(queryWithSource).toEqual('includedInDataCatalog.name:query');

    // non existing field with symbol
    const result = encodeString('name@id:query');
    expect(result).toEqual('name@id\\:query');
  });
});
