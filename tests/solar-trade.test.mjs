import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';
const page=readFileSync(new URL('../solar-trade.html',import.meta.url),'utf8');
const solar=readFileSync(new URL('../insane-solar.html',import.meta.url),'utf8');
const script=readFileSync(new URL('../js/solar-trade.js',import.meta.url),'utf8');
test('trade page and discoverability',()=>{assert.match(solar,/href="\/solar-trade\.html"/);assert.match(page,/id="supplier-search"/);assert.match(page,/id="supplier-category"/);assert.match(page,/id="supplier-results"/);assert.match(page,/id="copy-rfq"/);assert.match(page,/\/js\/solar-trade\.js/);});
test('safe trade claims and supplier links',()=>{assert.match(page,/not a live price engine/i);assert.match(script,/no purchase order is authorised/i);assert.match(script,/https:\/\/www\.segen\.co\.uk/);assert.match(script,/https:\/\/midsummerwholesale\.co\.uk/);assert.doesNotMatch(script,/fetch\(|XMLHttpRequest|localStorage/);});
test('RFQ copy is user initiated',()=>{assert.match(script,/addEventListener\('click'/);assert.match(script,/navigator\.clipboard\.writeText/);assert.match(script,/Do not substitute without written approval/);});
