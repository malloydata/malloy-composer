# Malloy Composer Demo

The Malloy Composer Demo is provided as a working example of an application built on top of Malloy. If you have any questions about getting it running, please reach out to us for help! If you find bugs or have feature requests, you can submit them as issues in this repo. [Learn how to use the composer](https://docs.google.com/presentation/d/18KUl_rrz2K-hbsiKJYS3rtTcYxZMXKklyPllLmTtIYY/edit#slide=id.g1269816dcbe_0_140)

Malloy Composer can be run with a built in web server (Full Mode) and can access BigQuery, Postgres and DuckDB or in WASM Mode, running entirely in a web browser.  In WASM Mode, Malloy Composer can only access csv and parquet files (via DuckDB).

The composer is only intended for demo purposes, and is not a finished or supported product.

_GitHub mutes videos by default, so make sure to unmute._

https://user-images.githubusercontent.com/7178946/170373869-3cf43dd2-25c4-4ed0-b038-450c33903ad5.mov

## Additional Resources:

* [Homepage](http://www.malloydata.dev)
* [Docs and Guides](https://malloydata.github.io/documentation/)
* [Malloy Github repository](https://github.com/malloydata/malloy/)
* Join our [Slack community](https://join.slack.com/t/malloy-community/shared_invite/zt-1kgfwgi5g-CrsdaRqs81QY67QW0~t_uw)

## Downloading and Running Composer (Full Mode)

1.  Download a Release of [Composer and Sample models](https://github.com/malloydata/malloy-composer/releases)
2.  Unzip the archive.
3.  _For MacOS, Linux_:
    - Make sure the binary is executable: `chmod a+x ./composer`
    - Remove the Apple quarantine flag: `xattr -d com.apple.quarantine ./composer`
4.  In your newly unzipped directory, run `./composer malloy-samples`

## Downloading and Running WASM Composer
Composer can run from a web server and is included in the samples. WASM Composer
can only use csv and parquet files (via DuckDB).

1.  Run the following commands
```
git clone git@github.com:malloydata/malloy-samples.git
cd malloy-samples
python -m SimpleHTTPServer
```
2. Goto http://localhost:8000/wasm in a web browser


## Running Composer from Source

1. `npm install` to install package dependencies
2. `git submodule init` and
3. `git submodule update` to install git dependencies
4  `npm run build`
5. `npm run start malloy-samples`

## Database Connections

You don't need to setup anything to run the DuckDB examples (the data is included with the samples).

To run the BigQuery Samples uou will need to have a [Google Cloud Account](https://cloud.google.com/), access to BigQuery, and the [gcloud CLI](https://cloud.google.com/sdk/gcloud) installed. Once the gcloud CLI is installed, open a terminal and type the following:

```
gcloud auth login --update-adc
gcloud config set project {my_project_id} --installation
```

Replace *{my_project_id}* with the **ID** of the BigQuery project you want to use & bill to. If you're not sure what this ID is, open Cloud Console, and click on the dropdown at the top (just to the right of the "Google Cloud Platform" text) to view projects you have access to. If you don't already have a project, create one.

## VSCode
You will likely want to set up the [VS Code Extension](https://github.com/malloydata/malloy-vscode-extension#install-the-visual-studio-code-extension) to view and edit Malloy files.

## Composer Parameters

This will start local webserver at [http://localhost:4000]() by default. The `path` argument allows you to configure what Malloy files you want the composer to have access to. There are several different options for what the `path` can be.

- A path to a single `.malloy` file
- A path to a directory containing multiple `.malloy` files*
- A path to a dataset config `.json` file\**
- A path to an app config `.json` file\**, specifying a `path` for multiple datasets. These dataset-specific paths can be any above path types.

\*Note that if you pass a directory containing a `composer.json` file, it will be used as either a "dataset" config `.json` file\*\* or an "app" config `.json` file\*\* depending on its contents.

\*\*See below for example config files

If you don't have a particular dataset you want to try out, you can always use the sample models: `npm run start ./malloy-samples`. You can also view these sample models in [an online version of the composer](https://malloydata.github.io/malloy-samples/wasm/).

### Troubleshooting Notes

- If your datasets are visible, but clicking on one doesn't work, check in the output of the `npm run start` command for errors. One of your Malloy files or config files may have an error in it.
- You'll need to define a [source](https://malloydata.github.io/documentation/language/source.html) for it to be explorable; top-level named queries that are not inside a source are not explorable.

### Config File Examples

"Dataset" config `.json` file:
```json
{
  "readme": <path to a readme file>,
  "title": <title of dataset>,
  "models": [
    {
      "id": "flights",
      "path": <path to a .malloy file>,
      "sources": [
        {
          "title": <title of source>,
          "sourceName": <name of source in the .malloy file>,
          "description": "Look at all the flights that have flown up to 2003"
        },
        ...
      ]
    }
  ]
}
```

"App" config `.json` file:
```json
{
  "apps": [
    {
      "id": "faa",
      "path": <path to dataset>
    },
    ...
  ],
  "readme": <path to readme file>
}
```

# Development

## Running against a local version of Malloy

If you're working on developing Malloy, and have changes to one of the other Malloy libraries locally on your machine, you can link the Composer to that version.

1. In your local Malloy repository, run `npm link -ws`. That will make your development packages locally available for development.
2. In your VS Code extension repository, run `npm run malloy-link` to use your local Malloy packages.
3. If you make changes to Malloy that are required by the extension, merges those into main, and that will trigger an automatic developer release of Malloy.
4. Once that release completes, run `npm run malloy-update` to update dependencies to that release. This will break the link to your local version of Malloy, so if you want to resume local development, re-run `npm run malloy-link`
5. To manually unlink without updating, you may run `npm run malloy-unlink`

## Debugging

### Using VSCode

- From VSCode Run & Debug Panel Select "Launch Composer" from the dropdown, then "Start Debugging" using the Run button or `F5`
- Then select "Launch Composer" from the dropdown, then "Start Debugging" using the Run button or `F5`
- To connect to the render process select "Attach to Composer Render Process"

## Running Composer entirely in Browser Mode (using DuckDB WASM)
Composer can run entirely in a browser with an included SQL engine.  Data and the composer applicaition is servered from a vanilla web server ([See lloyd's blogpost on the subject](https://lloydtabb.substack.com/p/exploring-data-with-only-a-webserver)).

There is a `duckdb-wasm` folder which should be served on a webserver in order to run an instance of the DuckDB WASM Mode Composer. The `duckdb-wasm/dist` folder contains the compiled app after running `npm run build-duckdb-wasm`. You can also run `npm run start-duckdb-wasm` to run the DuckDB WASM Mode Composer on port 9999.

The WASM Mode Composer can be easily added to any project that already uses the Fiddle, or it can be added to any repo with Malloy files using CSV or parquet files to simply serve the Composer experience on top of those files. All you need is to host the generated `app.js` and `app.css` files on some CDN (it can be the same CDN that serves the data and malloy files, or a different one), then to add a `composer.json` file that lists the available datasets (see the "app" config `.json` file example above).

Finally, add an `index.html` file, like this:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Malloy Composer</title>
    <link rel="stylesheet" href="dist/app.css" />
    <script src="dist/app.js" async defer></script>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
```
