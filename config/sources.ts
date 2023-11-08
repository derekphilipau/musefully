export interface Source {
  name: string; // Name of source
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
    location: 'UK',
    url: 'https://www.aestheticamagazine.com/',
  },
  aic: {
    name: 'Art Institute of Chicago',
    location: 'Chicago',
    url: 'https://www.artic.edu/',
  },
  artforum: {
    name: 'Artforum',
    location: 'New York',
    url: 'https://www.artforum.com/',
  },
  artnews: {
    name: 'ARTnews',
    location: 'New York',
    url: 'https://www.artnews.com/',
  },
  artsy: {
    name: 'Artsy',
    location: 'New York',
    url: 'https://www.artsy.net/',
  },
  bkm: {
    name: 'Brooklyn Museum',
    location: 'New York',
    url: 'https://www.brooklynmuseum.org/',
  },
  colossal: {
    name: 'Colossal',
    location: 'Chicago',
    url: 'https://www.thisiscolossal.com/',
  },
  cooperhewitt: {
    name: 'Cooper Hewitt',
    location: 'New York',
    url: 'https://www.cooperhewitt.org/',
  },
  guggenheim: {
    name: 'Guggenheim',
    location: 'New York',
    url: 'https://www.guggenheim.org/',
  },
  hifructose: {
    name: 'Hi-Fructose',
    location: 'Richmond',
    url: 'https://hifructose.com/',
  },
  hirshhorn: {
    name: 'Hirshhorn Museum and Sculpture Garden',
    location: 'Washington',
    url: 'https://hirshhorn.si.edu/',
  },
  hyperallergic: {
    name: 'Hyperallergic',
    location: 'New York',
    url: 'https://hyperallergic.com/',
  },
  juxtapoz: {
    name: 'Juxtapoz',
    location: 'San Francisco',
    url: 'https://www.juxtapoz.com/',
  },
  lacma: {
    name: 'LACMA',
    location: 'Los Angeles',
    url: 'https://www.lacma.org/',
  },
  mam: {
    name: 'Milwaukee Art Museum',
    location: 'Milwaukee',
    url: 'https://mam.org/',
  },
  met: {
    name: 'The Met',
    location: 'New York',
    url: 'https://www.metmuseum.org/',
  },
  moma: {
    name: 'MoMA',
    location: 'New York',
    url: 'https://www.moma.org/',
  },
  newmuseum: {
    name: 'New Museum',
    location: 'New York',
    url: 'https://www.newmuseum.org/',
  },
  newyorkercartoon: {
    name: 'New Yorker Daily Cartoon',
    location: 'New York',
    url: 'https://www.newyorker.com/cartoons/daily-cartoon',
  },
  nga: {
    name: 'National Gallery of Art',
    location: 'Washington',
    url: 'https://www.nga.gov/',
  },
  nyt: {
    name: 'NYT Art & Design',
    location: 'New York',
    url: 'https://www.nytimes.com/section/arts/design',
  },
  pma: {
    name: 'Philadelphia Museum of Art',
    location: 'Philadelphia',
    url: 'https://www.philamuseum.org/',
  },
  sam: {
    name: 'Seattle Art Museum',
    location: 'Seattle',
    url: 'https://www.seattleartmuseum.org/',
  },
  va: {
    name: 'Victoria & Albert Museum',
    location: 'London',
    url: 'https://www.vam.ac.uk/',
  },
  whitney: {
    name: 'Whitney Museum of American Art',
    location: 'New York',
    url: 'https://whitney.org/',
  },
};
