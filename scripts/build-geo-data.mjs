// Regenerates the compact location data used by address fields.
// Run with: bun scripts/build-geo-data.mjs
// Countries + states are bundled (small). Cities are split per country into
// public/geo/cities/<ISO>.json and downloaded only when a state is chosen,
// so phones never download or parse the full 8 MB world city list.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const assets = path.join(root, "node_modules/country-state-city/lib/assets");
const countries = JSON.parse(fs.readFileSync(path.join(assets, "country.json"), "utf8"));
const states = JSON.parse(fs.readFileSync(path.join(assets, "state.json"), "utf8"));
const cities = JSON.parse(fs.readFileSync(path.join(assets, "city.json"), "utf8"));

const outLib = path.join(root, "src/lib/geo");
const outCities = path.join(root, "public/geo/cities");
fs.mkdirSync(outLib, { recursive: true });
fs.rmSync(outCities, { recursive: true, force: true });
fs.mkdirSync(outCities, { recursive: true });

const countryRows = countries
  .map((c) => [c.isoCode, c.name])
  .sort((a, b) => a[1].localeCompare(b[1]));
fs.writeFileSync(path.join(outLib, "countries.json"), JSON.stringify(countryRows));

const stateMap = {};
for (const s of states) (stateMap[s.countryCode] ||= []).push([s.isoCode, s.name]);
for (const k of Object.keys(stateMap)) stateMap[k].sort((a, b) => a[1].localeCompare(b[1]));
fs.writeFileSync(path.join(outLib, "states.json"), JSON.stringify(stateMap));

const cityMap = {};
for (const [name, cc, sc] of cities) {
  const byState = (cityMap[cc] ||= {});
  (byState[sc] ||= []).push(name);
}
let files = 0;
for (const [cc, byState] of Object.entries(cityMap)) {
  for (const k of Object.keys(byState)) byState[k] = [...new Set(byState[k])].sort((a, b) => a.localeCompare(b));
  fs.writeFileSync(path.join(outCities, `${cc}.json`), JSON.stringify(byState));
  files++;
}
console.log(`countries=${countryRows.length} states=${states.length} cityFiles=${files}`);
