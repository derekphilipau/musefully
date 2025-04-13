# Setup Guide

Download & install the project, set up an Elasticsearch service, and load the data. Optionally, add your own data & ingesters.

## Download & Install

Fork/download this project and run `npm i` to install dependencies.

Then, run the development server with `npm run dev` and open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

If you have not yet loaded the Elasticsearch data, you should see an error on the search page that the index does not exist.

## Elasticsearch Setup

You can run Elasticsearch in a Docker container locally or in the cloud.

### Cloud Elasticsearch

1. [Sign up for an Elasticsearch Cloud account](https://cloud.elastic.co/).
2. Create a deployment. The free tier is sufficient for development.

Note that [musefully.org](https://musefully.org) with >300k documents currently runs on Elasticsearch Cloud with a minimal storage optimized AWS deployment for about $20/month.

### Local Elasticsearch

The `/docker` folder contains a `docker-compose` file for running Elasticsearch locally.

1. `cd docker`
2. `docker compose up`.

## Environment Variables

Once you have a running Elasticsearch service, you can add the connection details to the environment variables.

For local development, add a local `.env.local` file in the root directory. If `ELASTICSEARCH_USE_CLOUD` is "true", the Elastic Cloud vars will be used, otherwise the \_HOST, \_PROTOCOL, \_PORT, \_CA_FILE, and \_API_KEY vars will be used. You may need to copy the http_ca.crt from the Elasticsearch Docker container to a local directory like `./secrets`.

On [Formspree](https://formspree.io/) you should set up a basic contact form and enter the `FORMSPREE_FORM_ID` env variable.

OpenAI & Google vars only necessary if using OpenAI to extract exhibition & event data from URL's. In that case, a Google sheet is used to store the extracted content.

For cloud deployments (for example on Vercel), add the same variables to the Environment Variables of your deployment.

```
ELASTICSEARCH_USE_CLOUD=true
ELASTICSEARCH_CLOUD_ID=elastic-my-museum:dXMtY3VudHJhbDEuZ4NwLmNsb1VkLmVzLmlvOjQ0MyQ5ZEhiNWQ2NDM0NTB0ODgwOGE1MGVkZDViYzhjM2QwMSRjNmE2M2IwMmE3NDQ0YzU1YWU2YTg4YjI2ZTU5MzZmMg==
ELASTICSEARCH_CLOUD_USERNAME=elastic
ELASTICSEARCH_CLOUD_PASSWORD=changeme
ELASTICSEARCH_HOST=localhost
ELASTICSEARCH_PROTOCOL=https
ELASTICSEARCH_PORT=9200
ELASTICSEARCH_CA_FILE=./secrets/es01.crt
ELASTICSEARCH_API_KEY=MVE2aWxZUIJBWkNOUzYwU1ZKbUg6dEllY4JjQkVTZ3lFWlU3RRdLUm5mQQ==
ELASTICSEARCH_BULK_LIMIT=2000
CRON_SECRET=supersecretrandomstringover16characters
NEXT_PUBLIC_IMAGE_DOMAIN=rx3rxq8hyni2c.cloudfront.net
PROCESS_IMAGES=true
FORMSPREE_FORM_ID=rwejcdbw
OPENAI_API_KEY=sk-231rZaTl2w2MnRPOrsT1T9BlckFJes7O2D1RIOqEkvV2SEAZ
OPENAI_MODEL=gpt-4-1106-preview
GOOGLE_SERVICE_ACCOUNT_EMAIL=my-service-account@my-service-account.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nVih4dOFRfzXT....UV2Xdw==\n-----END PRIVATE KEY-----\n"
GOOGLE_SPREADSHEET_ID=1Vih4dOFRfzXTBopWmsi65_Xn5CNfuGnVe14_Pt7EncOr
```

## Loading the data

From the command line, run: `npm run import`

Data files are stored in `/data/[source]/[index].jsonl.gz`.
The import script, `importDataCommand.ts`, will load compressed data from .jsonl.gz files in the data directory into Elasticsearch indices. **_Warning: This will modify Elasticsearch indices._**

This command will:

1. Load environment variables from `.env.local`
2. Ask if you want to proceed with the import
3. Ask if you want to import the art index (all records)
4. Ask if you want to import the content index (all records)
5. Ask if you want to update dominant colors. This will only update colors for images which haven't already been analyzed.
6. Ask if you want to update RSS feeds to the content index.

The import process will take some time, as it inserts 2000 documents at a time using Elasticsearch bulk and then rests for a couple seconds.

## Add your data

Add a collections dataset:

1. Export collections data to JSON
2. Write an ingester which maps data to the Elasticsearch index.
   - Create ingester in `lib/import/ingesters/`
   - In `config/site.ts`, add the ingester to the `ingesters` array.
   - Run `npm run import` to import the dataset.

Add an RSS feed:

1. Add the RSS feed URL to `config/site.ts` in the `rssFeeds` array.

## Testing

The project uses Jest for unit and integration testing and Playwright for end-to-end testing.

Run Jest tests in watch mode:

```bash
npm run test
```

Run Jest tests in CI mode (single run):

```bash
npm run test:ci
```

Run Playwright end-to-end tests:

```bash
npm run test:e2e
```

## Deploy

Once you have a running Elasticsearch service, you can deploy the project to a hosting service like Vercel.

On Vercel, add the necessary environment variables to your deployment.

For automatic syncing of RSS feeds, add a cron job to your hosting service. For example, on Vercel, add a cron job to `vercel.json`:

```
{
  "crons": [
    {
      "path": "/api/import/rss",
      "schedule": "0 * * * *"
    }
  ]
}
```

Please see [Securing cron jobs](https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs) for more information on securing cron jobs using Vercel's CRON_SECRET environment variable sent as an Authorization header.

## Backups

Aside from normal Elasticsearch snapshots, server backups, and restoring for source data files, you can also export the Elasticsearch indices to JSONL files using elasticdump.

Some data, like historical rss feed content, is only stored in Elasticsearch and can only be restored from Elasticsearch snapshots or JSONL backups.

[Install instructions](https://github.com/elasticsearch-dump/elasticsearch-dump)

Full backup of Elasticsearch Cloud deployment:

```
multielasticdump \
  --direction=dump \
  --match='^.*$' \
  --input=https://myusername:mypassword@my-deployment.es.us-east-1.aws.elastic-cloud.com \
  --output=./es_backup_2023
```
