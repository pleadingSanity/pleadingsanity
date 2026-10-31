import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const songs = JSON.parse(readFileSync(new URL("../music/songs.json", import.meta.url), "utf8"));
const page = readFileSync(new URL("../sanity-songs.html", import.meta.url), "utf8");
const player = readFileSync(new URL("../js/sanity-songs.js", import.meta.url), "utf8");
const own = readFileSync(new URL("../music/index.html", import.meta.url), "utf8");
const blocked = ["6RtmetiP1DI", "htlYxsxPdSE", "OIdApbEXL5U", "oCpyfQykuG8", "AH8HLrwIQec", "hRLpwZcxPVE", "q1hXYMfNwAw", "aFGkOXGKhO4"];

test("Sanity's Songs is labelled as playlist picks and does not hide the player", () => {
  assert.match(page, /Sanity's Songs - picks from Shane's playlists/);
  assert.match(page, /id="yt-slot"/);
  assert.doesNotMatch(page, /<audio/);
  assert.doesNotMatch(page, /download=/);
  assert.match(player, /youtube-nocookie\.com/);
  assert.match(player, /track\.youtube/);
  assert.doesNotMatch(player, /mediaSession|hidden\s*=\s*true|display:\s*none/);
});

test("included tracks are other artists, embed ids only, official ones first", () => {
  assert.equal(songs.tracks.length, 21);
  assert.equal(songs.tracks.filter((track) => track.official).length, 13);
  const firstUnofficial = songs.tracks.findIndex((track) => !track.official);
  assert.ok(songs.tracks.slice(0, firstUnofficial).every((track) => track.official));
  for (const track of songs.tracks) {
    assert.match(track.id, /^[A-Za-z0-9_-]{11}$/);
    assert.equal(track.youtube, `https://www.youtube.com/watch?v=${track.id}`);
    assert.ok(track.artist && track.title && track.channel);
    assert.ok(!blocked.includes(track.id));
  }
  assert.doesNotMatch(JSON.stringify(songs.tracks), /cosmic-healing|Lyrics/);
});

test("the file player is only for audio the owner owns", () => {
  assert.match(own, /only for audio files Shane owns/);
  assert.match(own, /not copied here/);
});
