# Optional astrology feature — build and integration brief

## Implemented draft

`cosmic-reflections.html`, `css/cosmic-reflections.css` and
`js/cosmic-reflections.js` provide an isolated, unlinked preview. It reuses existing
brand art; offers Western tropical, Vedic sidereal or both; explains their basis;
prepares a copyable chart request; and offers grounded reflection prompts.
It calculates no planets, houses, dashas or predictions and labels this clearly.
It collects only optional name, birth date, known/unknown time and birth town/country.
Details remain in memory/form fields for the tab, with explicit copy and clear. Editing a field invalidates the old brief; Enter submits
the form without navigation. Clipboard completion cannot overwrite a later clear.
No local storage, query-string export, telemetry or network request carries them.

## Current provider boundary

Destiny AI Astrology is connected to this ChatGPT conversation. Its `get_reading`
action requires a name, birth date, local time, birth city and geocoded coordinates;
email is optional and unnecessary. Use both systems when the user requests both.
No birth date/time/place is established by the attached website files. Do not
invent these inputs or call the provider with a guessed time. Ask for missing
birth details if the user wants a personal reading.

A ChatGPT connector is not a website backend credential or embeddable public API.
Before real website charts: verify a documented provider API, licensing, account
access, quota/cost limits and user consent for transferring birth details. Do not
create an unofficial proxy to the ChatGPT connector. Default budget stays £0.

## Calculation requirements before a real chart launch

- Resolve the submitted birth location with an explicit user confirmation if
  ambiguous. Derive the historical timezone and daylight-saving offset for the
  birth date; current UTC offset is insufficient.
- For Western charts, declare the tropical zodiac and selected house system.
- For Vedic charts, declare sidereal zodiac and ayanamsa; propose Lahiri as an
  explicit configurable default, not an unstated fact. Distinguish lunar nodes
  settings. Compare source-calculated outputs for known reference charts.
- Treat unknown birth time honestly: do not show precise Ascendant, houses or
  time-sensitive timing techniques as if confirmed. A noon substitution must not
  silently become the user's birth time.
- Present interpretation as reflective tradition; do not diagnose mental illness,
  decide treatment, predict death, guarantee money or tell people they have a
  supernatural mission. Keep support and user choice easy to reach.
- Use deterministic ephemeris calculations for chart geometry; image generation
  may create decorative artwork, never exact planetary positions or chart data.

## Acceptance and rollout

Run `node --experimental-vm-modules --test scripts/test-cosmic-reflections.mjs`
for validation and DOM-event tests. Test phone/desktop layout, keyboard labels,
copy failure fallback, clear/reset,
unknown time, future-date rejection, literal rendering of malicious text and zero
network/storage writes from birth input. Add page-specific CSP and service-worker
privacy treatment before any real remote integration; do not weaken existing
private/Arron routes. Keep this draft out of navigation until owner review.
A safe rollback removes the new isolated page/assets/skill; existing features do
not depend on them. No schema, account migration or production deployment is needed
for the preview.

## Sources checked 24 October 2026

- [Astrodienst sidereal ephemeris explanation](https://www.astro.com/swisseph/sweph_sla_e.htm): tropical equinox basis, sidereal systems and common Indian Lahiri usage.
- [Swiss Ephemeris documentation](https://www.astro.com/swisseph/swisseph.htm): settings and calculation reference; inspect its licence before choosing a library.
- Connected Destiny AI Astrology tool schema inspected in this session; no personal
  chart call made because required birth details are missing.
