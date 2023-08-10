// {"id":6678,"prefix":"","name":"Judy Chicago","suffix":"","nationality":"American","role":"Artist","dates":"American, born 1939","start_year":1939,"end_year":9999,"date_added":"2008-07-03","rank":1}
export interface BkmArtist {
  id: number;
  prefix?: string | null;
  name?: string | null;
  suffix?: string | null;
  nationality?: string | null;
  role?: string | null;
  dates?: string | null;
  start_year?: number;
  end_year?: number;
  date_added?: string | null;
  rank?: number;
}

// {"id":8,"name":"Contemporary Art","folder":"contemporary_art","rank":0}
export interface BkmCollection {
  id: number;
  name: string | null;
  folder?: string | null;
  rank?: number;
}

// {"id":3411,"title":"DEATH TO THE LIVING, Long Live Trash"}
export interface BkmExhibition {
  id: number;
  title: string | null;
}

// {"id":10569,"status":"active","filename":"2002.10-PS-12_runner_PS1.jpg","date":"","credit":"","description":"","view":"group","date_added":"2008-09-19","rank":4,"is_color":"","load_date":"2016-11-22","updated_at":"2021-11-18 04:01:29","object_image_id":10569,"object_id":166076}
export interface BkmImage {
  id: number;
  status?: string | null;
  filename?: string | null;
  date?: string | null;
  credit?: string | null;
  description?: string | null;
  view?: string | null;
  date_added?: string | null;
  rank?: number;
  is_color?: number;
  load_date?: string | null;
  updated_at?: string | null;
  object_image_id?: number;
  object_id?: number;
}

// {"name":"copyright cleared: license on file with restrict","public_name":"© artist or artist's estate","description":"The Brooklyn Museum holds a non-exclusive license to reproduce images of this work of art from the rights holder named here..."}
export interface BkmRightsType {
  name: string | null;
  public_name?: string | null;
  description?: string | null;
}

// {"id":9455,"title":"2004.82.1, 1991.127.3a&ndash;b<br />","content":"","summary":"","rank":0,"label_date":"2019-10-25","date_added":"2019-11-25 16:03:25","approved_for_web":1}
export interface BkmLabel {
  id: number;
  title: string | null;
  content?: string | null;
  summary?: string | null;
  rank?: number;
  label_date?: string | null;
  date_added?: string | null;
  approved_for_web?: number;
}

// {"id":22003,"name":"Elizabeth A. Sackler Center for Feminist Art, 4th Floor","is_public":1,"is_floor":false,"parent_location_id":2147482028}
export interface BkmMuseumLocation {
  id: number;
  name: string | null;
  is_public?: number;
  is_floor?: boolean;
  parent_location_id?: number;
}

// {"accession_number":"1991.127.3a-b","object_id":146948} 
export interface BkmRelatedItem {
  accession_number: string | null;
  object_id: number;
}

// {"id":5027,"name":"China","type":"Place made","locale":null,"city":null,"region":null,"sub_region":null,"state":null,"country":"China","continent":"Asia","sub_continent":null,"latitude":null,"longitude":null}
export interface BkmGeographicalLocation {
  id: number;
  name: string | null;
  type?: string | null;
  locale?: string | null;
  city?: string | null;
  region?: string | null;
  sub_region?: string | null;
  state?: string | null;
  country?: string | null;
  continent?: string | null;
  sub_continent?: string | null;
  latitude?: number;
  longitude?: number;
}

export interface BkmDocument {
  id: number;
  title: string | null;
  accession_number?: string | null;
  accession_date?: string | null;
  object_date?: string | null;
  object_date_begin?: number;
  object_date_end?: number;
  period?: string | null;
  dynasty?: string | null;
  description?: string | null;
  provenance?: string | null;
  medium?: string | null;
  dimensions?: string | null;
  edition?: string | null;
  portfolio?: string | null;
  state?: string | null;
  markings?: string | null;
  signed?: string | null;
  inscribed?: string | null;
  credit_line?: string | null;
  copyright?: string | null;
  classification?: string | null;
  public_access?: number;
  approvals_mask?: number;
  copyright_restricted?: number;
  visible?: number;
  date_added?: string | null;
  highlight?: number;
  primary_image?: string | null;
  section?: string | null;
  museum_location?: BkmMuseumLocation;
  rights_type?: BkmRightsType;
  labels?: BkmLabel[];
  artists?: BkmArtist[];
  collections?: BkmCollection[];
  exhibitions?: BkmExhibition[];
  related_items?: BkmRelatedItem[];
  geographical_locations?: BkmGeographicalLocation[];
  images?: BkmImage[];
}
