import {
  normalizeName,
  searchUlanArtists,
} from '@/lib/import/ulan/searchUlanArtists';

const testCases = [
  {
    name: 'Pablo Picasso',
    normalizedName: 'pablo picasso',
    ulanName: 'Picasso, Pablo',
  },
  {
    name: 'Enoch Wood & Sons',
    normalizedName: 'enoch wood sons',
    ulanName: '',
  },
  {
    name: 'She-we-na (Zuni Pueblo)',
    normalizedName: 'she we na',
    ulanName: '',
  },
  {
    name: 'Utagawa Kunisada (Toyokuni III)',
    normalizedName: 'utagawa kunisada',
    ulanName: 'Utagawa Kunisada',
  },
  {
    name: 'S. Van Campen & Company',
    normalizedName: 'van campen company',
    ulanName: '',
  },
  {
    name: 'Charles T. Grosjean',
    normalizedName: 'charles grosjean',
    ulanName: '',
  },
  {
    name: 'Augustus (Auguste Emmanuel) Eliaers',
    normalizedName: 'augustus eliaers',
    ulanName: '',
  },
  {
    name: 'Allen & Brother',
    normalizedName: 'allen brother',
    ulanName: '',
  },
  {
    name: 'George W. Shiebler & Co.',
    normalizedName: 'george shiebler co',
    ulanName: '',
  },
  {
    name: 'Nicolás Enríquez',
    normalizedName: 'nicolas enriquez',
    ulanName: 'Enriquez, Nicolás',
  },
  {
    name: "Shafi' Abbasi",
    normalizedName: 'shafi abbasi',
    ulanName: "Muhammad Shafi'",
  },
  {
    name: 'Ebrié',
    normalizedName: 'ebrie',
    ulanName: '',
  },
  {
    name: "Pietro  di Giovanni d'Ambrogio",
    normalizedName: 'pietro di giovanni d ambrogio',
    ulanName: "Pietro di Giovanni d'Ambrogio",
    birthYear: 1428,
    deathYear: 1449,
  },
  {
    name: "Pietro  di Giovanni d'Ambrogio",
    normalizedName: 'pietro di giovanni d ambrogio',
    ulanName: "Pietro di Giovanni d'Ambrogio",
  },
  {
    name: 'Utagawa Hiroshige (Ando)',
    normalizedName: 'utagawa hiroshige',
    ulanName: 'Andō Hiroshige',
    birthYear: 1797,
    deathYear: 1858,
  },
];

describe('normalizeName function', () => {
  testCases.forEach((testCase) => {
    it(`should return "${testCase.normalizedName}" for "${testCase.name}" with removeParentheticals = ${testCase.removeParentheticals}`, () => {
      const normalizedName = normalizeName(testCase.name, true);
      expect(normalizedName).toBe(testCase.normalizedName);
    });
  });
});

describe('ULAN Artist Search', () => {
  testCases.forEach((test) => {
    it(`should properly search for ULAN artist: ${test.name}`, async () => {
      const result = await searchUlanArtists(
        test.name,
        test.birthYear,
        test.deathYear
      );
      expect(test.ulanName).toBe(result?.preferredTerm || '');
    });
  });
});
