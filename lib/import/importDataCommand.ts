/**
 * Import Elasticsearch data from JSON files.
 */
import { loadEnvConfig } from '@next/env';

import { siteConfig } from '@/config/site';
import { abort, askYesNo, info, questionsDone, warn } from '@/lib/command';
import extractDocumentsToSheet from './extract/extractDocumentsToSheet';
import { updateAdditionalMetadata } from './updateAdditionalMetadata';
import { updateDominantColors } from './updateDominantColors';
import updateFromFile from './updateFromFile';
import updateRssFeeds from './updateRssFeed';

loadEnvConfig(process.cwd());

async function importDataset(
  ingesterName: string,
  includeSourcePrefix: boolean
) {
  try {
    const { ingester } = await import(`./ingesters/${ingesterName}`);
    await updateFromFile(ingester, includeSourcePrefix);
  } catch (e) {
    abort(`Error updating with ${ingesterName}: ${e}`);
    return;
  }
}

async function run() {
  info('Import data from gzipped JSONL files.');

  if (siteConfig.ingesters.length === 0) {
    warn('No ingesters specified.');
    return abort();
  }

  info(`Available ingesters: ${siteConfig.ingesters.join(', ')}`);

  if (process.env.ELASTICSEARCH_USE_CLOUD === 'true')
    warn('WARNING: Using Elasticsearch Cloud');
  else warn('Using Elasticsearch host at ' + process.env.ELASTICSEARCH_HOST);

  if (
    !(await askYesNo(
      'Proceeding will overwrite existing Elasticsearch indices & data. Continue?'
    ))
  )
    return abort();

  info('Beginning import of Elasticsearch data from JSON files...');

  const includeSourcePrefix = siteConfig.isMultiSource;

  for (const ingesterName of siteConfig.ingesters) {
    if (await askYesNo(`Import using ${ingesterName}?`)) {
      await importDataset(ingesterName, includeSourcePrefix);
    }
  }

  if (await askYesNo(`Update indices with additional metadata?`)) {
    const additionalMetadataDataFile = `./data/additionalMetadata.jsonl`;
    await updateAdditionalMetadata(additionalMetadataDataFile);
  }

  if (await askYesNo(`Update dominant colors?`)) await updateDominantColors();

  if (await askYesNo(`Update RSS Feeds to news index?`)) {
    await updateRssFeeds();
  }

  if (await askYesNo(`Extract documents using OpenAI GPT?`)) {
    await extractDocumentsToSheet();
  }

  questionsDone();
}

run();
