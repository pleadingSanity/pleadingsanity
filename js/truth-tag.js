// ==============================================================
// PLEADING SANITY — TRUTH TAG PRACTICE
// Evidence · Experience · Philosophy. Gentle explanations, always.
// Accuracy is private and never compared with anyone.
// ==============================================================

import { loadProgress, saveProgress, onProgressSync } from '/js/progress.js';
import { loadMe } from '/js/auth.js';

const GAME = 'truth-tag';
const ROUND = 10;
const CATS = {
  evidence: { icon: '🔬', name: 'Evidence' },
  experience: { icon: '💙', name: 'Experience' },
  philosophy: { icon: '🌌', name: 'Philosophy' },
};
const DEFAULTS = {
  practised: 0, rounds: 0,
  cats: { evidence: { seen: 0, right: 0 }, experience: { seen: 0, right: 0 }, philosophy: { seen: 0, right: 0 } },
  recent: [],
};

// [id, category, statement, why]
const E = 'evidence', X = 'experience', P = 'philosophy';
const BANK = [
  // ── EVIDENCE ──
  ['e1', E, 'The London Gazette of 29 November 1945 records Mentions in Despatches.', 'This can be checked in a published public record. It is a fact about a document, not a personal story.'],
  ['e2', E, 'At standard pressure, water freezes at 0 degrees Celsius.', 'A checkable physical fact. Anyone can look up the conditions and test the claim.'],
  ['e3', E, 'A calendar week has seven days.', 'A simple published convention. You can check it on any calendar. It is not an opinion.'],
  ['e4', E, 'Light in a vacuum travels at about 300,000 kilometres a second.', 'A measured figure from physics. The exact value can be looked up. It is evidence, not a feeling.'],
  ['e5', E, 'The Earth takes about one year to orbit the Sun.', 'A checkable fact about the solar system, not one person\'s account of their year.'],
  ['e6', E, 'Private A.L. Cooper served in the Royal Army Ordnance Corps and was Mentioned in Despatches.', 'It names a person, a corps, and a public honour. The honour is in the London Gazette. Nothing is added.'],
  ['e7', E, 'Pleading Sanity keeps its source code in the public repository pleadingSanity/pleadingsanity.', 'You can open the repository and see the files. That is a checkable fact about where the copy lives.'],
  ['e8', E, 'Under the Equality Act 2010, a mental health condition can count as a disability if it has a substantial and long-term effect on daily life.', 'This comes from UK law, which is written down and can be checked.'],
  ['e9', E, 'Mind reports that around 1 in 4 people in England experience a mental health problem of some kind each year.', 'It\'s a statistic attributed to a named source — you can check where it comes from and how it was measured.'],
  ['e10', E, 'Research has linked regular physical activity with a lower risk of depression.', 'This points to a body of studies that can be checked. Note it says "linked" — careful evidence often does.'],
  ['e11', E, 'Alcohol is a depressant, and drinking heavily can make anxiety and low mood worse over time.', 'This reflects well-established medical research, not a personal view about drinking.'],
  ['e12', E, 'Caffeine can stay in your body for several hours and may affect how well you sleep.', 'A checkable, research-based fact about how caffeine works in the body.'],
  ['e13', E, 'Studies have linked long-term loneliness with poorer physical and mental health.', 'It describes research findings that can be looked up and examined.'],
  ['e14', E, 'The crying-brain mark is the only logo this house uses.', 'You can check the pages. One mark, cyan on near-black. That is a fact about the site, not a belief.'],
  ['e15', E, 'Research suggests that slow breathing with a longer out-breath can help the body shift towards a calmer state.', 'This refers to studies on breathing and the nervous system. "Suggests" is honest wording — the evidence is promising rather than final.'],
  ['e16', E, 'A suspended host can take a website\'s domain offline. The files can still exist in a repository and in an installed app.', 'This is how hosting works. You can check it against any host\'s own suspension rules. It is not a promise that a site lasts forever.'],
  // ── EXPERIENCE ──
  ['x1', X, 'Running clears my head more than anything.', 'It\'s true for this person, and that matters — but it\'s their lived experience, not something that applies to everyone.'],
  ['x2', X, 'When I finally told my mum how I was feeling, I slept properly for the first time in weeks.', 'A personal story. Real and valid, and it may help others feel less alone — but it\'s one person\'s experience.'],
  ['x3', X, 'Writing things down at night stops my thoughts going round in circles.', 'The word "my" is a clue: this is what works for them, from their own life.'],
  ['x4', X, 'My dog is the reason I get out of bed on the hard days.', 'Deeply true for them. Lived experience doesn\'t need research to be worth sharing.'],
  ['x5', X, 'The first time I told the whole story out loud, it felt awkward, but the person stayed until I finished.', 'It is about how it felt for them. That is lived experience, not a service you can look up.'],
  ['x6', X, 'The first medication I tried didn\'t help me, but the second one did.', 'A personal account. It can be useful to hear, but it isn\'t a rule for anyone else\'s treatment.'],
  ['x7', X, 'I feel far more anxious in crowded places than I used to.', 'This describes their own feelings over time — lived truth.'],
  ['x8', X, 'Cold-water swimming makes me feel alive.', 'Their experience. Someone else might feel only cold — both are honest.'],
  ['x9', X, 'Since I stopped scrolling before bed, I wake up less tired.', 'It sounds a bit like research, but it\'s one person noticing a change in their own life. That\'s experience.'],
  ['x10', X, 'Grief came back to me in waves, years after my dad died.', 'A lived truth. Many people recognise it, but here it\'s told as personal experience.'],
  ['x11', X, 'Talking to strangers in a support group was easier for me than talking to my friends.', 'Their own experience — and a perfectly valid one.'],
  ['x12', X, 'When I have a panic attack, it feels like my chest is being squeezed.', 'A description of what it\'s like for them. Experience is how we learn what things feel like from the inside.'],
  ['x13', X, 'Making my bed each morning gives me a small sense of control.', 'A personal habit and how it feels to them — experience.'],
  ['x14', X, 'Losing my job knocked my confidence far more than I expected.', 'An honest account of their own life. No one can fact-check how it felt — and they don\'t need to.'],
  // ── PHILOSOPHY / OPINION ──
  ['p1', P, 'Everyone deserves a second chance.', 'A value or belief about how people should be treated. You can agree or disagree, but it can\'t be proven true or false.'],
  ['p2', P, 'Kindness is never wasted.', 'A hopeful belief about the world. Many people hold it, but it\'s a philosophy rather than a checkable fact.'],
  ['p3', P, 'Social media does more harm than good.', 'This is an overall judgement. Research on social media is mixed, so as a sweeping statement it\'s opinion.'],
  ['p4', P, 'Mental health should be taught in every school.', '"Should" is a clue — it\'s a view about what ought to happen, which is philosophy or opinion.'],
  ['p5', P, 'Your worth isn\'t measured by how productive you are.', 'A value about what makes a person worthwhile. Many of us need to hear it — it\'s still philosophy.'],
  ['p6', P, 'Everything happens for a reason.', 'A belief about the meaning of events. It can bring comfort to some people and hurt others, and it can\'t be tested.'],
  ['p7', P, 'Asking for help is braver than struggling alone.', 'An interpretation of what courage looks like — a value judgement, so philosophy.'],
  ['p8', P, 'Real success means being at peace with yourself, not being rich.', 'A belief about what success means. People define it differently.'],
  ['p9', P, 'We owe it to future generations to look after the planet.', 'A moral view about responsibility. Climate science is evidence; what we "owe" is philosophy.'],
  ['p10', P, 'Forgiveness is more for you than for the other person.', 'An interpretation of what forgiveness is for. It may ring true, but it\'s a perspective rather than a fact.'],
  ['p11', P, 'People are basically good.', 'A belief about human nature. Philosophers have argued about this for thousands of years.'],
  ['p12', P, 'Healing isn\'t linear.', 'Many people\'s experience matches this, but as a general statement it\'s an interpretation of what recovery is like — philosophy.'],
  ['p13', P, 'Work should fit around life, not the other way round.', 'Another "should" — a view about how things ought to be.'],
  ['p14', P, 'A four-day working week would make the UK a happier country.', 'It\'s a prediction and an opinion. Trials can give evidence about parts of it, but the overall claim is a judgement.'],
];

const $ = (id) => document.getElementById(id);
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

let state = load();
function load() {
  const s = { ...structuredClone(DEFAULTS), ...loadProgress(GAME, DEFAULTS) };
  s.cats = { ...structuredClone(DEFAULTS.cats), ...(s.cats || {}) };
  if (!Array.isArray(s.recent)) s.recent = [];
  return s;
}
function save() {
  state.recent = state.recent.slice(-30);
  saveProgress(GAME, state);
  renderStats();
}

loadMe().then((me) => {
  if (!me) return;
  document.querySelectorAll('[data-sg-guest]').forEach((n) => { n.hidden = true; });
  document.querySelectorAll('[data-sg-member]').forEach((n) => { n.hidden = false; });
}).catch(() => {});

const statement = $('tt-statement');
const progress = $('tt-progress');
const answers = [...document.querySelectorAll('.tt-answer')];
const feedback = $('tt-feedback-wrap');
const nextBtn = $('tt-next');
const restartBtn = $('tt-restart');

let round = [];
let pos = 0;
let matchedThisRound = 0;

function newRound() {
  // Prefer statements not seen recently, so rounds feel fresh.
  const recent = new Set(state.recent);
  const fresh = shuffle(BANK.filter((b) => !recent.has(b[0])));
  const rest = shuffle(BANK.filter((b) => recent.has(b[0])));
  round = [...fresh, ...rest].slice(0, ROUND);
  shuffle(round);
  pos = 0;
  matchedThisRound = 0;
  restartBtn.hidden = true;
  if (window.PSVoice) PSVoice.speak('Evidence, lived experience, or philosophy. Take your time.');
  show();
}

function show() {
  const [, , text] = round[pos];
  progress.textContent = `Statement ${pos + 1} of ${ROUND}`;
  statement.textContent = text;
  statement.hidden = false;
  feedback.innerHTML = '';
  nextBtn.hidden = true;
  answers.forEach((b) => {
    b.disabled = false;
    b.hidden = false;
    b.classList.remove('is-picked', 'is-right');
    b.removeAttribute('aria-describedby');
  });
}

function answer(cat) {
  const [id, truth, , why] = round[pos];
  const right = cat === truth;
  state.practised += 1;
  state.cats[truth].seen += 1;
  if (right) { state.cats[truth].right += 1; matchedThisRound += 1; }
  state.recent.push(id);
  save();
  answers.forEach((b) => {
    b.disabled = true;
    b.classList.toggle('is-picked', b.dataset.cat === cat && !right);
    b.classList.toggle('is-right', b.dataset.cat === truth);
  });
  const t = CATS[truth];
  const head = right ? `Good eye — ${t.icon} ${t.name}.` : `Close — here's the nuance. We'd tag this ${t.icon} ${t.name}.`;
  feedback.innerHTML = `<div class="tt-feedback"><h3></h3><p></p></div>`;
  feedback.querySelector('h3').textContent = head;
  feedback.querySelector('p').textContent = why;
  nextBtn.textContent = pos === ROUND - 1 ? 'See how the round went' : 'Next statement';
  nextBtn.hidden = false;
  nextBtn.focus();
}

function endRound() {
  state.rounds += 1;
  save();
  progress.textContent = 'Round complete';
  statement.hidden = true;
  answers.forEach((b) => { b.hidden = true; });
  const others = ROUND - matchedThisRound;
  const line = others === 0
    ? 'Your tags matched ours every time. Lovely clear thinking.'
    : `Your tags matched ours on ${matchedThisRound} of ${ROUND}. The other ${others} are where the interesting nuance lives — that's where the learning happens.`;
  feedback.innerHTML = `<div class="tt-feedback"><h3>Thank you for practising 💙</h3><p></p></div>`;
  feedback.querySelector('p').textContent = `${line} This stays private to you.`;
  nextBtn.hidden = true;
  restartBtn.hidden = false;
  if (window.PSGames) {
    PSGames.record('truth-tag', { score: matchedThisRound * 25, level: 1, maxCombo: matchedThisRound });
    PSGames.markWeekly('truth-tag');
  }
  if (window.PSVoice) PSVoice.speak('Round complete. That stays with you.');
  restartBtn.focus();
}

answers.forEach((b) => b.addEventListener('click', () => { if (!b.disabled) answer(b.dataset.cat); }));
nextBtn.addEventListener('click', () => {
  if (pos >= ROUND - 1) { endRound(); return; }
  pos += 1;
  show();
  answers[0].focus();
});
restartBtn.addEventListener('click', () => { newRound(); answers[0].focus(); });

function renderStats() {
  const items = [
    [state.practised, state.practised === 1 ? 'statement practised' : 'statements practised'],
    [state.rounds, state.rounds === 1 ? 'round completed' : 'rounds completed'],
  ];
  $('tt-stats').innerHTML = items.map(([v, l]) => `<li><b>${v}</b>${l}</li>`).join('');
  $('tt-bars').innerHTML = Object.entries(CATS).map(([k, c]) => {
    const { seen, right } = state.cats[k];
    const pct = seen ? Math.round((right / seen) * 100) : 0;
    const text = seen ? `${right} of ${seen} matched` : 'Not tried yet';
    return `<li><span>${c.icon} ${c.name}</span><span class="tt-bar" aria-hidden="true"><span style="width:${pct}%"></span></span><span class="muted">${text}</span></li>`;
  }).join('');
}

onProgressSync((games) => {
  if (!games.includes(GAME)) return;
  state = load();
  renderStats();
});

renderStats();
newRound();
