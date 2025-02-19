import { fetchMods } from "../fetch-mods";
import modsJson from "./mods.json";
// import { discordHookUrl, ghToken, discordModHookUrls } from "./secrets.json";
import { googleServiceAccount } from "./secrets.json";
import nextDatabase from "./next-database.json";
import previousDatabase from "./previous-database.json";
import { getDiff } from "../get-diff";
import { sendDiscordNotifications } from "../send-discord-notifications";
import { toJsonString } from "../to-json-string";
import { getViewCounts } from "../get-view-counts";
import { getInstallCounts } from "../get-install-counts";

async function test() {
  const installCounts = await getInstallCounts(googleServiceAccount);

  console.log("installCounts", toJsonString(installCounts));
}

test();
