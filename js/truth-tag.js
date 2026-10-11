// ==============================================================
// PLEADING SANITY — TRUTH TAG PRACTICE
// Known · Experience · Thought · Belief · Unknown. Gentle explanations, always.
// Accuracy is private and never compared with anyone.
// ==============================================================

import { loadProgress, saveProgress, onProgressSync } from '/js/progress.js';
import { loadMe } from '/js/auth.js';

const GAME = 'truth-tag';
const ROUND = 10;
const CATS = {
  known: { icon: '🔬', name: 'Known' },
  experience: { icon: '💙', name: 'Experience' },
  thought: { icon: '💭', name: 'Thought' },
  belief: { icon: '🌌', name: 'Belief' },
  unknown: { icon: '❔', name: 'Unknown' },
};
const DEFAULTS = {
  practised: 0, rounds: 0,
  cats: {
    known: { seen: 0, right: 0 },
    experience: { seen: 0, right: 0 },
    thought: { seen: 0, right: 0 },
    belief: { seen: 0, right: 0 },
    unknown: { seen: 0, right: 0 },
  },
  recent: [],
};

// [id, category, statement, why]
const K = 'known', X = 'experience', T = 'thought', B = 'belief', U = 'unknown';
// [id, category, statement, why]
const BANK = [
  // ── KNOWN ──
  ['k1', K, 'A calendar week has seven days.', 'This is a checkable convention used by calendars. It is not a personal opinion.'],
  ['k2', K, 'Water freezes at 0 degrees Celsius at standard atmospheric pressure.', 'This is a measurable physical fact under stated conditions.'],
  ['k3', K, 'The Earth orbits the Sun.', 'This is supported by extensive observation and measurement and can be independently verified.'],
  ['k4', K, 'Light travels through a vacuum at about 300,000 kilometres per second.', 'This is a measured physical constant, with the exact value defined in modern physics.'],
  ['k5', K, 'The Moon orbits the Earth.', 'Its orbit is directly observable and has been measured extensively.'],
  ['k6', K, 'The UK has a written Equality Act 2010.', 'The Act is a public piece of UK legislation that can be checked directly.'],
  ['k7', K, 'Pleading Sanity publishes its website source code in the pleadingSanity/pleadingsanity repository.', 'The repository is publicly inspectable, so this claim can be checked.'],
  ['k8', K, 'A triangle has three sides.', 'This is a definitional fact in ordinary Euclidean geometry.'],
  ['k9', K, 'The human heart is a muscular organ that pumps blood around the body.', 'This is established anatomy and physiology, not a personal belief.'],
  ['k10', K, 'Regular physical activity is associated with a range of health benefits.', 'This is supported by a substantial body of research, while the size of the benefit varies by activity and person.'],
  ['k11', K, 'Caffeine can affect sleep, especially when consumed later in the day.', 'This is supported by research on caffeine and sleep; individual sensitivity varies.'],
  ['k12', K, 'Private A.L. Cooper was Mentioned in Despatches in 1945.', 'This is a claim about a historical public record and should be checked against the relevant record.'],

  // ── EXPERIENCE ──
  ['x1', X, 'Running clears my head more than anything.', 'The word "my" makes this personal. It tells us what works for one person, not a universal rule.'],
  ['x2', X, 'Writing things down at night helps me stop thoughts going round in circles.', 'This is a report of someone’s own experience of journalling.'],
  ['x3', X, 'My dog gives me a reason to get outside on difficult days.', 'It describes what a relationship and routine mean to one person.'],
  ['x4', X, 'Crowded places make me much more anxious than they used to.', 'That is a lived description of one person’s feelings.'],
  ['x5', X, 'Cold-water swimming makes me feel alive.', 'Someone else may feel completely differently. That is exactly why this belongs to Experience.'],
  ['x6', X, 'When I stopped scrolling before bed, I woke up feeling less tired.', 'It is a personal observation, even though similar questions can also be studied scientifically.'],
  ['x7', X, 'Talking to strangers in a support group felt easier for me than talking to friends.', 'This describes one person’s experience of connection.'],
  ['x8', X, 'Making my bed each morning gives me a small sense of control.', 'The important part is how the habit feels to the person describing it.'],
  ['x9', X, 'Losing my job knocked my confidence far more than I expected.', 'No experiment is needed to establish that this is what the person experienced.'],
  ['x10', X, 'The first time I told my whole story aloud, I felt exposed but relieved.', 'This is an account of an individual emotional experience.'],
  ['x11', X, 'Music helps me settle when my mind is racing.', 'Useful lived experience, but it does not mean music will have the same effect on everyone.'],
  ['x12', X, 'I feel more hopeful after a long walk.', 'It reports a personal change in feeling rather than making a universal claim.'],

  // ── THOUGHT ──
  ['t1', T, 'Could social media be designed around connection instead of attention?', 'This is a question and idea. It is not claiming that a particular answer has already been proved.'],
  ['t2', T, 'Maybe people learn better when they can admit they do not know.', 'A hypothesis about learning and uncertainty. It could be investigated.'],
  ['t3', T, 'Perhaps games can teach critical thinking without feeling like school.', 'An idea worth testing, rather than an established fact.'],
  ['t4', T, 'What if an AI had to show where an answer came from before we trusted it?', 'A design thought experiment about AI transparency.'],
  ['t5', T, 'I wonder whether slower feeds would help people notice more meaningful posts.', 'An open hypothesis. Evidence would be needed to know how much it helps.'],
  ['t6', T, 'Maybe the best reputation system rewards contribution rather than popularity.', 'A product and community idea, not a proven universal rule.'],
  ['t7', T, 'Could humans and AI compete creatively while still helping each other improve?', 'A question about how collaboration and competition might coexist.'],
  ['t8', T, 'I think a platform should let people decide whether AI may learn from their posts.', 'This is a design position expressed as a thought, not a fact about what every platform already does.'],
  ['t9', T, 'Perhaps admitting uncertainty could make online conversations less hostile.', 'A plausible hypothesis that could be tested, not a certainty.'],
  ['t10', T, 'Could a private journal become more useful when you can see patterns without exposing the entries publicly?', 'A product idea involving privacy and reflection.'],
  ['t11', T, 'Maybe the best online communities need fewer metrics, not more.', 'A proposition about community design.'],
  ['t12', T, 'What would social media look like if wellbeing mattered more than time spent?', 'An open design question with no single established answer.'],

  // ── BELIEF ──
  ['b1', B, 'Everyone deserves a second chance.', 'This is a moral belief about how people should be treated.'],
  ['b2', B, 'Kindness is never wasted.', 'A hopeful value or belief, not a claim that can be settled by one experiment.'],
  ['b3', B, 'Your worth is not measured by how productive you are.', 'A belief about human value. It is central to dignity, but it is not a scientific measurement.'],
  ['b4', B, 'Asking for help can be an act of courage.', 'A value judgement about what courage can look like.'],
  ['b5', B, 'Real success means being at peace with yourself, not being rich.', 'A personal definition of success. People can reasonably define success differently.'],
  ['b6', B, 'We owe future generations a healthier planet.', 'The evidence about environmental change is one thing; the moral claim about what we owe is a belief.'],
  ['b7', B, 'People are basically good.', 'A long-standing philosophical position about human nature.'],
  ['b8', B, 'Healing does not have to look the same for everyone.', 'A value and perspective about individual journeys, not a measurable law.'],
  ['b9', B, 'No one person owns the whole truth.', 'A philosophical commitment to humility and dialogue.'],
  ['b10', B, 'Love is more important than money.', 'A value statement about priorities.'],
  ['b11', B, 'People should be judged by how they treat others, not by what they have survived.', 'A moral position about dignity and judgement.'],
  ['b12', B, 'Evolution, Not Erasure is a better way to describe survival than pretending the past never happened.', 'A guiding philosophy of Pleading Sanity, not a scientific theory.'],

  // ── UNKNOWN ──
  ['u1', U, 'We do not currently know whether life exists elsewhere in the universe.', 'No confirmed discovery has established extraterrestrial life. The honest tag is Unknown.'],
  ['u2', U, 'We do not have a complete explanation for why subjective consciousness exists.', 'Consciousness is heavily studied, but there is no universally accepted final explanation of subjective experience.'],
  ['u3', U, 'We do not know exactly how the first life on Earth began.', 'There are scientific hypotheses and evidence about early life, but the complete origin story remains unresolved.'],
  ['u4', U, 'We do not know whether the universe is finite or infinite.', 'Cosmology constrains possibilities, but the ultimate global geometry and extent of the universe remain unresolved.'],
  ['u5', U, 'We do not know whether intelligent life elsewhere has ever detected Earth.', 'There is no confirmed evidence that extraterrestrial intelligence has detected us.'],
  ['u6', U, 'We do not know exactly why one person dreams about a particular thing on a particular night.', 'Dreaming has been studied extensively, but the meaning and causes of individual dreams are not fully settled.'],
  ['u7', U, 'We do not know whether there are other universes beyond the observable universe.', 'Some theories consider possibilities beyond our observable universe, but there is no confirmed evidence establishing other universes.'],
  ['u8', U, 'We do not know the ultimate nature of dark matter.', 'Its gravitational effects are observed, but its underlying physical identity has not been conclusively established.'],
  ['u9', U, 'We do not know whether a machine could ever have subjective consciousness.', 'This is an unresolved philosophical and scientific question, not a settled fact.'],
  ['u10', U, 'We do not know exactly what the next major scientific breakthrough will be.', 'By definition, a future discovery is not currently known.'],
  ['u11', U, 'We do not know every factor that will shape a particular person’s future.', 'Human lives are influenced by many interacting factors, making exact individual futures unknowable in advance.'],
  ['u12', U, 'We do not know every reason a person chooses one dream or goal over another.', 'People can explain their motives, but there is no complete universal account of every individual decision.'],
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
  if (window.PSVoice) PSVoice.speak('Known, lived experience, thought, belief, or unknown. Take your time.');
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
  feedback.querySelector('p').textContent = `${line} This stays private to you. Another round is waiting.`;
  nextBtn.hidden = true;
  restartBtn.hidden = false;
  if (window.PSGames) {
    PSGames.record('truth-tag', { score: matchedThisRound * 25, level: 1, maxCombo: matchedThisRound });
    PSGames.markWeekly('truth-tag');
    PSGames.confetti();
    PSGames.sfx('good', matchedThisRound);
    PSGames.pulse(feedback, 'good');
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
