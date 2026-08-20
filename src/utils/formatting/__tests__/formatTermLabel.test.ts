import { formatTermLabel } from '../formatTermLabel';

describe('formatTermLabel', () => {
  it.each([
    ['MolecularSequence', 'Molecular Sequence'],
    ['GeneVariant', 'Gene Variant'],
    ['ClinicalStudy', 'Clinical Study'],
    ['ScholarlyArticle', 'Scholarly Article'],
    ['ElectronicMedicalRecord', 'Electronic Medical Record'],
    ['MedicalRiskScore', 'Medical Risk Score'],
    ['ProteinSet', 'Protein Set'],
    ['TherapeuticProcedure', 'Therapeutic Procedure'],
  ])('splits PascalCase: %s -> %s', (input, expected) => {
    expect(formatTermLabel(input)).toBe(expected);
  });

  it.each([
    ['Genome', 'Genome'],
    ['Proteome', 'Proteome'],
    ['Nucleotide Sequence', 'Nucleotide Sequence'],
    ['Antimicrobial Peptide', 'Antimicrobial Peptide'],
    ['Genotype/Phenotype Annotation', 'Genotype/Phenotype Annotation'],
  ])('leaves already-readable values alone: %s', (input, expected) => {
    expect(formatTermLabel(input)).toBe(expected);
  });

  // A blanket title-case would flatten these to "3d Em Map" / "Dna".
  it.each([
    ['3D EM Map', '3D EM Map'],
    ['3D', '3D'],
    ['DNA', 'DNA'],
    ['HIV/AIDS', 'HIV/AIDS'],
    ['RNA-Seq', 'RNA-Seq'],
  ])('preserves acronyms and digits: %s', (input, expected) => {
    expect(formatTermLabel(input)).toBe(expected);
  });

  // Requiring 2+ lowercase letters before the capital is what protects these.
  // A single [a-z] would yield "M RNAseq" and "I PSC Line".
  it.each([
    ['mRNAseq', 'mRNAseq'],
    ['mRNA', 'mRNA'],
    ['iPSC line', 'iPSC Line'],
  ])('does not split a lowercase-prefixed acronym: %s', (input, expected) => {
    expect(formatTermLabel(input)).toBe(expected);
  });

  it('capitalizes words that are entirely lowercase', () => {
    expect(formatTermLabel('electron micrograph')).toBe('Electron Micrograph');
    expect(formatTermLabel('tomogram')).toBe('Tomogram');
  });

  it('cannot split a boundary between two capitals', () => {
    // The pill and table paths still get the API's
    // displayName for values like this.
    expect(formatTermLabel('DNASequence')).toBe('DNASequence');
  });

  it('trims and handles empty input', () => {
    expect(formatTermLabel('  GeneVariant  ')).toBe('Gene Variant');
    expect(formatTermLabel('   ')).toBe('');
    expect(formatTermLabel('')).toBe('');
    expect(formatTermLabel(undefined as unknown as string)).toBe('');
  });
});
