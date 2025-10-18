export interface Source {
  name: string; // Name of source
  shortName?: string; // Display name for badges
  location?: string; // Location of source
  url: string; // URL of source
}

export interface SourceMap {
  [key: string]: Source;
}

/**
 * List of sources.
 */
export const sources: SourceMap = {
  aesthetica: {
    name: 'Aesthetica',
    shortName: 'Aesthetica',
    location: 'UK',
    url: 'https://www.aestheticamagazine.com/',
  },
  aic: {
    name: 'Art Institute of Chicago',
    shortName: 'AIC',
    location: 'Chicago',
    url: 'https://www.artic.edu/',
  },
  artforum: {
    name: 'Artforum',
    shortName: 'Artforum',
    location: 'New York',
    url: 'https://www.artforum.com/',
  },
  artnews: {
    name: 'ARTnews',
    shortName: 'ARTnews',
    location: 'New York',
    url: 'https://www.artnews.com/',
  },
  artsy: {
    name: 'Artsy',
    shortName: 'Artsy',
    location: 'New York',
    url: 'https://www.artsy.net/',
  },
  bkm: {
    name: 'Brooklyn Museum',
    shortName: 'BkM',
    location: 'New York',
    url: 'https://www.brooklynmuseum.org/',
  },
  cma: {
    name: 'Cleveland Museum of Art',
    shortName: 'CMA',
    location: 'Cleveland',
    url: 'https://www.clevelandart.org/',
  },
  colossal: {
    name: 'Colossal',
    shortName: 'Colossal',
    location: 'Chicago',
    url: 'https://www.thisiscolossal.com/',
  },
  cooperhewitt: {
    name: 'Cooper Hewitt',
    shortName: 'Cooper Hewitt',
    location: 'New York',
    url: 'https://www.cooperhewitt.org/',
  },
  getty: {
    name: 'Getty Museum',
    shortName: 'Getty',
    location: 'Los Angeles',
    url: 'https://www.getty.edu/museum/',
  },
  guggenheim: {
    name: 'Guggenheim',
    shortName: 'Guggenheim',
    location: 'New York',
    url: 'https://www.guggenheim.org/',
  },
  harvard: {
    name: 'Harvard Art Museums',
    shortName: 'Harvard',
    location: 'Cambridge',
    url: 'https://harvardartmuseums.org/',
  },
  hifructose: {
    name: 'Hi-Fructose',
    shortName: 'Hi-Fructose',
    location: 'Richmond',
    url: 'https://hifructose.com/',
  },
  hirshhorn: {
    name: 'Hirshhorn Museum and Sculpture Garden',
    shortName: 'Hirshhorn',
    location: 'Washington',
    url: 'https://hirshhorn.si.edu/',
  },
  hyperallergic: {
    name: 'Hyperallergic',
    shortName: 'Hyperallergic',
    location: 'New York',
    url: 'https://hyperallergic.com/',
  },
  juxtapoz: {
    name: 'Juxtapoz',
    shortName: 'Juxtapoz',
    location: 'San Francisco',
    url: 'https://www.juxtapoz.com/',
  },
  lacma: {
    name: 'LACMA',
    shortName: 'LACMA',
    location: 'Los Angeles',
    url: 'https://www.lacma.org/',
  },
  mam: {
    name: 'Milwaukee Art Museum',
    shortName: 'MAM',
    location: 'Milwaukee',
    url: 'https://mam.org/',
  },
  met: {
    name: 'The Met',
    shortName: 'Met',
    location: 'New York',
    url: 'https://www.metmuseum.org/',
  },
  moma: {
    name: 'MoMA',
    shortName: 'MoMA',
    location: 'New York',
    url: 'https://www.moma.org/',
  },
  newmuseum: {
    name: 'New Museum',
    shortName: 'New Museum',
    location: 'New York',
    url: 'https://www.newmuseum.org/',
  },
  newyorkercartoon: {
    name: 'New Yorker Daily Cartoon',
    shortName: 'New Yorker',
    location: 'New York',
    url: 'https://www.newyorker.com/cartoons/daily-cartoon',
  },
  nga: {
    name: 'National Gallery of Art',
    shortName: 'NGA',
    location: 'Washington',
    url: 'https://www.nga.gov/',
  },
  nyt: {
    name: 'NYT Art & Design',
    shortName: 'NYT',
    location: 'New York',
    url: 'https://www.nytimes.com/section/arts/design',
  },
  pma: {
    name: 'Philadelphia Museum of Art',
    shortName: 'PMA',
    location: 'Philadelphia',
    url: 'https://www.philamuseum.org/',
  },
  rijks: {
    name: 'Rijksmuseum',
    shortName: 'Rijks',
    location: 'Amsterdam',
    url: 'https://www.rijksmuseum.nl/',
  },
  sam: {
    name: 'Seattle Art Museum',
    shortName: 'SAM',
    location: 'Seattle',
    url: 'https://www.seattleartmuseum.org/',
  },
  smithsonian: {
    name: 'Smithsonian Institution',
    shortName: 'Smithsonian',
    location: 'Washington',
    url: 'https://americanart.si.edu/',
  },
  vam: {
    name: 'Victoria and Albert Museum',
    shortName: 'V&A',
    location: 'London',
    url: 'https://www.vam.ac.uk/',
  },
  whitney: {
    name: 'Whitney Museum of American Art',
    shortName: 'Whitney',
    location: 'New York',
    url: 'https://whitney.org/',
  },
};
