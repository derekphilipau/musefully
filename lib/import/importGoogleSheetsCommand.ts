import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

import {
  abort,
  askYesNo,
  info,
  questionsDone,
  warn,
} from '@/lib/command';
import updateFromGoogleSheet from './updateFromGoogleSheet';

async function run() {
  info('Musefully Google Sheets Import');

  if (process.env.ELASTICSEARCH_USE_CLOUD === 'true') {
    warn('WARNING: Using Elasticsearch Cloud');
  } else {
    warn(
      'Using Elasticsearch host at ' + process.env.ELASTICSEARCH_LOCAL_NODE
    );
  }

  if (!(await askYesNo('Import data from configured Google Sheets?'))) {
    return abort();
  }

  await updateFromGoogleSheet();
  questionsDone();
}

run();
