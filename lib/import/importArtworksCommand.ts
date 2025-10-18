import { promises as fs } from 'fs';
import path from 'path';
import { loadEnvConfig } from '@next/env';

import { siteConfig } from '@/config/site';
import { sources } from '@/config/sources';
import { abort, askYesNo, info, questionsDone, warn } from '@/lib/command';
import { ingester as artworksIngester } from './ingesters/artworks/artworksIngester';
import { updateAdditionalMetadata } from './updateAdditionalMetadata';
import updateFromFile from './updateFromFile';
import updateRssFeeds from './updateRssFeed';

loadEnvConfig(process.cwd());

const DATA_ROOT = path.resolve(process.cwd(), 'data');

interface ArtworkSourceFolder {
  slug: string;
  path: string;
  label: string;
}

type PromptState = 'prompt' | 'include' | 'skip';

async function getArtworkSourceFolders(): Promise<ArtworkSourceFolder[]> {
  try {
    const dirEntries = await fs.readdir(DATA_ROOT, { withFileTypes: true });
    const candidateDirs = dirEntries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b));

    const folders: ArtworkSourceFolder[] = [];
    for (const slug of candidateDirs) {
      const folderPath = path.join(DATA_ROOT, slug);
      const entries = await fs.readdir(folderPath);
      if (entries.length === 0) continue;
      folders.push({
        slug,
        path: folderPath,
        label: sources[slug]?.name || slug,
      });
    }
    return folders;
  } catch (error) {
    warn(`Unable to read artwork data directory (${DATA_ROOT}): ${error}`);
    return [];
  }
}

async function run() {
  info('Musefully Artworks Import');
  info(
    `Image CDN base: ${
      process.env.MUSEFULLY_IMAGE_CDN_BASE_URL || 'not configured'
    }`
  );

  const artworkFolders = await getArtworkSourceFolders();
  if (artworkFolders.length === 0) {
    warn(
      'No artwork data folders found. Ensure JSON files exist under ./data/<source>/.'
    );
    return abort();
  }

  if (process.env.ELASTICSEARCH_USE_CLOUD === 'true') {
    warn('WARNING: Using Elasticsearch Cloud');
  } else {
    warn('Using Elasticsearch host at ' + process.env.ELASTICSEARCH_LOCAL_NODE);
  }

  const rawArgs = process.argv.slice(2);
  const selectedSlugSet = new Set<string>();
  let datasetMode: 'interactive' | 'all' = 'interactive';
  let metadataMode: PromptState = 'skip';
  let rssMode: PromptState = 'skip';

  const pushSlugs = (value: string | undefined) => {
    if (!value) return;
    value
      .split(',')
      .map((slug) => slug.trim().toLowerCase())
      .filter(Boolean)
      .forEach((slug) => {
        if (slug === 'all') {
          datasetMode = 'all';
          selectedSlugSet.clear();
        } else if (datasetMode !== 'all') {
          selectedSlugSet.add(slug);
        }
      });
  };

  const parsePromptState = (value: string | undefined): PromptState => {
    if (!value) return 'include';
    const normalized = value.trim().toLowerCase();
    switch (normalized) {
      case 'true':
      case 'yes':
      case 'include':
      case '1':
        return 'include';
      case 'false':
      case 'no':
      case 'skip':
      case '0':
        return 'skip';
      case 'prompt':
      case 'ask':
        return 'prompt';
      default:
        warn(`Unrecognized option "${value}". Using "prompt" instead.`);
        return 'prompt';
    }
  };

  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i];
    const normalized = arg.toLowerCase();

    if (normalized === '--all') {
      datasetMode = 'all';
      selectedSlugSet.clear();
      continue;
    }

    if (
      normalized.startsWith('--dataset=') ||
      normalized.startsWith('--datasets=') ||
      normalized.startsWith('--source=') ||
      normalized.startsWith('--sources=')
    ) {
      pushSlugs(arg.split('=')[1]);
      continue;
    }

    if (
      normalized === '--dataset' ||
      normalized === '--datasets' ||
      normalized === '--source' ||
      normalized === '--sources' ||
      normalized === '-d' ||
      normalized === '-s'
    ) {
      pushSlugs(rawArgs[i + 1]);
      i += 1;
      continue;
    }

    if (
      normalized.startsWith('--metadata=') ||
      normalized.startsWith('--with-metadata=')
    ) {
      metadataMode = parsePromptState(arg.split('=')[1]);
      continue;
    }

    if (normalized === '--metadata' || normalized === '--with-metadata') {
      metadataMode = 'include';
      continue;
    }

    if (normalized.startsWith('--rss=') || normalized.startsWith('--feeds=')) {
      rssMode = parsePromptState(arg.split('=')[1]);
      continue;
    }

    if (normalized === '--rss' || normalized === '--feeds') {
      rssMode = 'include';
      continue;
    }

    if (arg.startsWith('--')) {
      continue;
    }

    pushSlugs(arg);
  }

  const selectedSlugs = Array.from(selectedSlugSet);
  const hasExplicitSlugs = selectedSlugs.length > 0;
  const isInteractive = !hasExplicitSlugs && datasetMode === 'interactive';

  if (isInteractive) {
    if (
      !(await askYesNo(
        'Proceeding will overwrite existing Elasticsearch indices & data. Continue?'
      ))
    ) {
      return abort();
    }
  } else {
    info('Running in non-interactive mode; proceeding without confirmation.');
  }

  const includeSourcePrefix = siteConfig.isMultiSource;

  let foldersToProcess: ArtworkSourceFolder[] = artworkFolders;

  if (hasExplicitSlugs) {
    foldersToProcess = artworkFolders.filter((folder) =>
      selectedSlugs.includes(folder.slug)
    );

    if (foldersToProcess.length === 0) {
      warn(
        `No matching sources found for: ${selectedSlugs.join(
          ', '
        )}. Available sources: ${artworkFolders
          .map((folder) => folder.slug)
          .join(', ')}`
      );
      return abort();
    }

    const missing = selectedSlugs.filter(
      (slug) => !foldersToProcess.some((folder) => folder.slug === slug)
    );
    if (missing.length > 0) {
      warn(`Skipping unknown sources: ${missing.join(', ')}`);
    }
  } else if (datasetMode === 'all') {
    foldersToProcess = artworkFolders;
  }

  if (foldersToProcess.length === 0) {
    warn('No datasets selected for import. Exiting.');
    return abort();
  }

  for (const folder of foldersToProcess) {
    const shouldImport = isInteractive
      ? await askYesNo(
          `Import ${folder.label} (${folder.slug}) from ${path.relative(
            process.cwd(),
            folder.path
          )}?`
        )
      : true;
    if (!shouldImport) continue;

    info(`Importing ${folder.label}...`);
    await updateFromFile(
      {
        ...artworksIngester,
        dataFilename: folder.path,
      },
      includeSourcePrefix,
      {
        clearSourceIds: [folder.slug],
      }
    );
  }

  const shouldRunMetadata = async (): Promise<boolean> => {
    if (metadataMode === 'include') return true;
    if (metadataMode === 'skip') return false;
    if (!isInteractive) {
      info('Skipping additional metadata update (use --metadata to enable).');
      return false;
    }
    return askYesNo(`Update indices with additional metadata?`);
  };

  if (await shouldRunMetadata()) {
    const additionalMetadataDataFile = path.join(
      process.cwd(),
      'data',
      'additionalMetadata.jsonl'
    );
    try {
      await fs.access(additionalMetadataDataFile);
      await updateAdditionalMetadata(additionalMetadataDataFile);
    } catch {
      warn(
        'No additional metadata file found at data/additionalMetadata.jsonl. Skipping.'
      );
    }
  }

  const shouldRunRss = async (): Promise<boolean> => {
    if (rssMode === 'include') return true;
    if (rssMode === 'skip') return false;
    if (!isInteractive) {
      info('Skipping RSS updates (use --rss to enable).');
      return false;
    }
    return askYesNo(`Update RSS Feeds to news index?`);
  };

  if (await shouldRunRss()) {
    await updateRssFeeds();
  }

  questionsDone();
}

run();
