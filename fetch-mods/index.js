const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios');

const MANIFEST_URL_BASE = 'https://raw.githubusercontent.com';
const JSON_INDENT = 2;

async function run() {
  try {
    const mods = JSON.parse(core.getInput('mods'));
    const gitHubToken = core.getInput('github-token');
    const octokit = new github.GitHub(gitHubToken);

    const results = [];
    for (mod of mods) {
      const [owner, repo] = mod.repo.split('/');

      const releaseList = (await octokit.repos.listReleases({
        owner: owner,
        repo: repo,
      })).data.filter(release => !release.prerelease);

      if (releaseList.length === 0) {
        continue;
      }

      const manifest = (await axios(
        `${MANIFEST_URL_BASE}/${owner}/${repo}/master/${mod.manifest}`
      )).data;

      results.push({
        releaseList,
        manifest,
      });
    }

    const modReleases = results.map(({ releaseList, manifest }) => {
      const releases = releaseList
        .filter(({ assets }) => assets.length > 0)
        .map(release => {
          const asset = release.assets[0];

          return {
            downloadUrl: asset.browser_download_url,
            downloadCount: asset.download_count,
          };
        });

      const totalDownloadCount = releases.reduce((accumulator, release) => {
        return accumulator + release.downloadCount;
      }, 0);

      const latestRelease = releases[0];

      const modInfo = {
        downloadUrl: latestRelease.downloadUrl,
        version: latestRelease.version,
        downloadCount: totalDownloadCount,
        manifest,
      };

      return modInfo;
    });

    const releasesJson = JSON.stringify(modReleases, null, JSON_INDENT);

    core.setOutput('releases', releasesJson);

  } catch (error) {
    core.setFailed(error.message);
    console.log('error', error);
  }
}

run();
