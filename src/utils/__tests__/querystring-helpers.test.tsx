import { encodeString } from '../querystring-helpers';

describe('encoding querystring helpers', () => {
  test('escapes ES reserved characters', () => {
    const result = encodeString('test&query=');
    expect(result).toEqual('test\\&query\\=');
  });

  test('Does not escape colons if preceeded by metadata field', () => {
    const result = encodeString('name:query');
    expect(result).toEqual('name:query');
  });

  test('Does not escape asterisks', () => {
    const result = encodeString('tubercu*');
    expect(result).toEqual('tubercu*');
  });

  test('Does escape colons if not preceeded by metadata field', () => {
    const result = encodeString('test:query');
    expect(result).toEqual('test\\:query');
  });

  test('Does escape parenthesis only if union is present', () => {
    const withParens = encodeString(
      'Cd treated Model organism or animal sample from triploid Carassius auratus red var. x (Carassius auratus red var. x Cyprinus carpio)',
    );
    expect(withParens).toEqual(
      'Cd treated Model organism or animal sample from triploid Carassius auratus red var. x \\(Carassius auratus red var. x Cyprinus carpio\\)',
    );

    // don't escape parens
    const withParensInUnion = encodeString('(EC) AND (M-2010-0374)');
    expect(withParensInUnion).toEqual('(EC) AND (M-2010-0374)');

    // keep escape if included
    const withEscapedParensInUnion = encodeString(
      '\\(EC\\) AND \\(M-2010-0374\\)',
    );
    expect(withEscapedParensInUnion).toEqual('\\(EC\\) AND \\(M-2010-0374\\)');
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

  test('Does not escape colons if preceeded by _exists_ field', () => {
    const exists_result = encodeString('_exists_:query');
    expect(exists_result).toEqual('_exists_:query');

    const not_exists_result = encodeString('-_exists_:query');
    expect(not_exists_result).toEqual('-_exists_:query');
  });
});
