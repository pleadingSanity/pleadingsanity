import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const about = readFileSync(new URL("../about.html", import.meta.url), "utf8");
const films = readFileSync(new URL("../js/about-films.js", import.meta.url), "utf8");
const kids = readFileSync(new URL("../kids.html", import.meta.url), "utf8");
const games = readFileSync(new URL("../games.html", import.meta.url), "utf8");
const home = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const safe = ["3d6Woc2Qk-g", "wUwrnUo2ECU", "9CVABTM5Xgk", "UREjWvLCVA8"];

test("About keeps the fight films on this page and the street clip behind the warning", () => {
  assert.match(about, /Not Scared/);
  assert.match(about, /Boxing footage/);
  assert.match(about, /Didn't know the rules\. Didn't back down\./);
  assert.match(films, /youtube-nocookie\.com\/embed\//);
  assert.match(films, /autoplay=0/);
  for (const id of safe) assert.match(about, new RegExp(id));
  const adult = about.slice(about.indexOf('class="fight-adult"'));
  assert.match(adult, /r_FpTRi0fEM/);
  assert.match(adult, /Contains real street violence/);
  assert.equal(about.slice(0, about.indexOf('class="fight-adult"')).includes("r_FpTRi0fEM"), false);
  assert.doesNotMatch(about, /Modern Jesus|Conor Mcgregor/);
  assert.match(about, /Bipolar: the strengths and the cost/);
  assert.match(about, /not medical advice/i);
  assert.match(about, /https:\/\/www\.nhs\.uk\/mental-health\/conditions\/bipolar-disorder\//);
  assert.match(about, /https:\/\/www\.nimh\.nih\.gov\/health\/publications\/bipolar-disorder/);
  assert.match(about, /https:\/\/www\.mind\.org\.uk\/information-support\/types-of-mental-health-problems\/bipolar-disorder\//);
  assert.match(about, /https:\/\/www\.bipolaruk\.org\//);
  assert.match(about, /"@type": "Person"/);
  assert.match(about, /"@type": "WebSite"/);
  assert.match(about, /"@type": "Organization"/);
});

test("kids, games and home do not carry the fight films", () => {
  for (const page of [kids, games, home]) {
    for (const id of [...safe, "r_FpTRi0fEM", "thecreatormma5440"]) {
      assert.equal(page.includes(id), false, id);
    }
  }
});
