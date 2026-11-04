/* Pleading Sanity: local, curated navigation search. No API, tracking or private-content access. */
(function(){'use strict';
var input=document.getElementById('ps-site-search');var output=document.getElementById('ps-search-results');if(!input||!output)return;
var pages=[
['Insane Radio','/insane-radio.html','Music, artists, songs, station, listen'],
['Games Hub','/games.html','Games, brain games, play, puzzles'],
['Sanity Solitaire','/sanity-solitaire.html','Cards, solitaire, games'],
['Cosmic Connect','/cosmic-connect.html','Connect, puzzle, games'],
['Truth Tag','/truth-tag.html','Truth, game, play'],
['Stardust Dash','/stardust-dash.html','Arcade, dash, game'],
['Night Table','/poker.html','Poker, cards, game'],
['Arron AI','/arron.html','Talk, chat, companion, mental health'],
['Journal Vault','/journal-vault.html','Journal, diary, write, notes'],
['Community','/community.html','People, connect, survivors'],
['Sanity Feed','/feed.html','Posts, social, community'],
['Live & Creators','/live.html','Live, creator, video, stream'],
['Creator Hub','/creator.html','Create, content, creator'],
['Kids Games','/kids.html','Children, kids, family, games'],
['Kids Cartoon Series','/kids-series.html','Cartoons, Ollie, kids'],
['Meditation','/meditation.html','Breathe, calm, silence, relax'],
['Frequencies','/frequencies.html','Sound, tones, Hz, music'],
['Aura Hz','/aura-hz.html','Sound, frequencies, audio'],
['Sane Finance','/finance.html','Money, finance, budget'],
['Insane Solar','/insane-solar.html','Solar, panels, energy'],
['AI Office','/solar-ai-office.html','Solar, office, automation'],
['Shop','/shop.html','Clothing, fashion, hoodie, joggers, apparel'],
['New Gen Bible','/new-gen-bible.html','Book, wisdom, writing'],
['Our Story','/about.html','Founder, Shane Cooper, legacy, mission'],
['Support','/support.html','Help, mental health, support'],
['Urgent Crisis Help','/crisis.html','Emergency, crisis, Samaritans, Shout, 999, 111'],
['App Hub','/app.html','Apps, install, tools'],
['Sign in','/login.html','Account, login, profile']
];
function norm(s){return s.toLocaleLowerCase('en-GB').trim();}
function render(){var q=norm(input.value);output.replaceChildren();if(!q)return;var words=q.split(/\s+/).filter(Boolean);var found=pages.filter(function(p){var text=norm(p.join(' '));return words.every(function(w){return text.includes(w);});}).slice(0,10);if(!found.length){var empty=document.createElement('p');empty.className='ps-no-results';empty.textContent='No matching pages. Try “radio”, “games”, “journal” or “support”.';output.appendChild(empty);return;}var list=document.createElement('ul');list.className='ps-search-list';found.forEach(function(p){var li=document.createElement('li'),a=document.createElement('a'),small=document.createElement('small');a.href=p[1];a.textContent=p[0];small.textContent=p[2].split(', ').slice(0,3).join(' · ');a.appendChild(small);li.appendChild(a);list.appendChild(li);});output.appendChild(list);}
input.addEventListener('input',render);
/* Search links from other pages land here with the field ready to type. */
if(window.location.hash==='#ps-site-search')input.focus();
window.addEventListener('hashchange',function(){if(window.location.hash==='#ps-site-search')input.focus();});
})();
