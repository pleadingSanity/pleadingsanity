// ==============================================================
// THE SANE FINANCE GBT — CALCULATION & TRUTH ENGINE
// Pure functions. No DOM, no network, no storage.
// Every figure here is a PLANNING ESTIMATE. It is never a provider
// eligibility result and never a lender decision.
// ==============================================================

export const LABELS = {
  estimate: "Planning estimate",
  eligibility: "Provider eligibility",
  decision: "Lender decision",
};

export const MAX_MONEY = 10_000_000; // anything above is treated as a typing error
export const PROVIDER_MAX_AGE_DAYS = 45;

// Safe number: blanks become 0, junk becomes 0, negatives become 0, huge values are capped.
export function num(value, { max = MAX_MONEY } = {}) {
  if (value === null || value === undefined || value === "") return 0;
  const n = typeof value === "number" ? value : Number(String(value).replace(/[£,\s]/g, ""));
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(n, max);
}

export const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

const PER_MONTH = { weekly: 52 / 12, fortnightly: 26 / 12, "four-weekly": 13 / 12, monthly: 1, annually: 1 / 12 };
export function toMonthly(amount, frequency = "monthly") {
  return num(amount) * (PER_MONTH[frequency] ?? 1);
}

// UK APR is an annual equivalent rate, so the monthly rate is (1 + APR)^(1/12) − 1.
export function monthlyRate(apr) {
  const a = num(apr, { max: 1000 }) / 100;
  return a ? Math.pow(1 + a, 1 / 12) - 1 : 0;
}

// Level monthly payment for an amortising loan, with an optional final (balloon) payment.
export function monthlyPayment(principal, apr, months, balloon = 0) {
  const p = num(principal);
  const n = Math.max(1, Math.round(num(months, { max: 600 })) || 1);
  const b = Math.min(num(balloon), p);
  const r = monthlyRate(apr);
  if (!p) return 0;
  if (!r) return (p - b) / n;
  const pvBalloon = b / Math.pow(1 + r, n);
  return ((p - pvBalloon) * r) / (1 - Math.pow(1 + r, -n));
}

// Work backwards: the largest amount a monthly budget could repay at a given APR and term.
export function borrowingForPayment(payment, apr, months) {
  const m = num(payment);
  const n = Math.max(1, Math.round(num(months, { max: 600 })) || 1);
  const r = monthlyRate(apr);
  if (!m) return 0;
  return r ? (m * (1 - Math.pow(1 + r, -n))) / r : m * n;
}

// ---------- FINANCE PROFILE ----------

export const EMPTY_PROFILE = Object.freeze({
  purpose: "", purchaseType: "personal", price: "", deposit: "", amount: "", term: "36", preferredMonthly: "", apr: "",
  income: "", incomeFrequency: "monthly", otherIncome: "", benefitsIncome: "",
  employment: "employed", employmentMonths: "", selfEmployedYears: "",
  essentials: "", commitments: "", totalDebt: "",
  missedPayments: "none", defaults: "none", ccj: "none", insolvency: "none", recentDecline: "no",
  creditHistory: "unknown", housing: "renting", ageOk: "",
  vehicleReg: "", vehicleAge: "", vehicleMileage: "", annualMileage: "", fees: "", balloon: "",
  behindOnBills: "no",
});

export function summariseMoney(profile) {
  const p = { ...EMPTY_PROFILE, ...(profile || {}) };
  const income = toMonthly(p.income, p.incomeFrequency) + num(p.otherIncome) + num(p.benefitsIncome);
  const essentials = num(p.essentials);
  const commitments = num(p.commitments);
  const disposable = income - essentials - commitments;
  return { income, essentials, commitments, disposable };
}

// ---------- AFFORDABILITY ----------

export function affordability(profile) {
  const p = { ...EMPTY_PROFILE, ...(profile || {}) };
  const money = summariseMoney(p);
  const price = num(p.price);
  const deposit = num(p.deposit);
  const fees = num(p.fees);
  const balloon = num(p.balloon);
  const term = Math.max(1, Math.round(num(p.term, { max: 600 })) || 36);
  const hasApr = p.apr !== "" && p.apr !== null && p.apr !== undefined;
  const apr = num(p.apr, { max: 1000 });
  let borrow = num(p.amount);
  if (!borrow && price) borrow = Math.max(0, price - deposit);
  const financed = borrow + fees; // fees added to the deal are borrowed too
  const payment = monthlyPayment(financed, apr, term, balloon);
  const totalRepayable = payment * term + balloon;
  const costOfCredit = Math.max(0, totalRepayable - borrow);
  const remaining = money.disposable - payment;
  const cautiousCeiling = Math.max(0, money.disposable * 0.8);
  const preferred = num(p.preferredMonthly);

  // Stress tests: what if life gets harder during the agreement?
  const stress = [
    { label: "Income falls by 10%", remaining: money.disposable - money.income * 0.1 - payment },
    { label: "Income falls by 25%", remaining: money.disposable - money.income * 0.25 - payment },
    { label: "Essential costs rise by 10%", remaining: money.disposable - money.essentials * 0.1 - payment },
    { label: "Essential costs rise by 20%", remaining: money.disposable - money.essentials * 0.2 - payment },
  ].map((s) => ({ ...s, remaining: round2(s.remaining), holds: s.remaining >= 0 }));

  let level = "unknown";
  const notes = [];
  if (!money.income) {
    notes.push("Add your income to see whether a payment leaves room for living.");
  } else if (money.disposable <= 0) {
    level = "over";
    notes.push("Your listed essentials and existing commitments already use all of your income.");
  } else if (payment && remaining < 0) {
    level = "over";
    notes.push("This payment is more than what is left after essentials and existing credit.");
  } else if (payment && payment > cautiousCeiling) {
    level = "tight";
    notes.push("This payment uses more than 80% of what is left. Very little room for surprises.");
  } else if (payment && stress.some((s) => !s.holds)) {
    level = "tight";
    notes.push("The payment fits today but fails at least one stress test.");
  } else if (payment) {
    level = "ok";
    notes.push("On your figures the payment fits, and it survives the stress tests below.");
  }
  if (preferred && payment > preferred) notes.push(`This is above the monthly payment you said you wanted (${preferred.toFixed(2)}).`);
  if (!hasApr && borrow) notes.push("No APR entered, so this was worked out at 0%. A real offer will almost certainly cost more.");
  if (balloon) notes.push("There is a final (balloon) payment. You must pay it, refinance it, or hand the item back under the agreement terms.");

  return {
    label: LABELS.estimate,
    ...Object.fromEntries(Object.entries(money).map(([k, v]) => [k, round2(v)])),
    price: round2(price), deposit: round2(deposit), fees: round2(fees), balloon: round2(balloon),
    borrow: round2(borrow), financed: round2(financed), apr, aprEntered: hasApr, term,
    payment: round2(payment), totalRepayable: round2(totalRepayable), costOfCredit: round2(costOfCredit),
    totalCashCost: round2(totalRepayable + deposit),
    remaining: round2(remaining), cautiousCeiling: round2(cautiousCeiling),
    maxBorrowAtCeiling: round2(borrowingForPayment(cautiousCeiling, apr, term)),
    stress, level, notes,
    earlySettlement: "Early-settlement terms are set by each agreement. Ask the provider for a settlement figure and any early-settlement charge before you sign.",
  };
}

// ---------- FINANCIAL DIFFICULTY SAFETY ROUTE ----------
// If new borrowing would likely make things worse, stop and point to free help.

export const FREE_DEBT_HELP = [
  { name: "MoneyHelper", url: "https://www.moneyhelper.org.uk/en/money-troubles/dealing-with-debt", note: "Free, impartial money and debt guidance, backed by government." },
  { name: "StepChange Debt Charity", url: "https://www.stepchange.org/", note: "Free debt advice charity." },
  { name: "National Debtline", url: "https://nationaldebtline.org/", note: "Free, independent debt advice." },
  { name: "Citizens Advice", url: "https://www.citizensadvice.org.uk/debt-and-money/", note: "Free help with debt and money problems." },
];

export function difficultyCheck(profile) {
  const p = { ...EMPTY_PROFILE, ...(profile || {}) };
  const m = summariseMoney(p);
  const reasons = [];
  if (p.behindOnBills === "yes") reasons.push("You said you are behind on bills or credit payments.");
  if (m.income && m.disposable <= 0) reasons.push("Your essentials and existing credit use up all of your income.");
  if (m.income && m.commitments > m.income * 0.4) reasons.push("Existing credit repayments take more than 40% of your income.");
  if (p.missedPayments === "recent") reasons.push("You have missed payments in the last six months.");
  if (p.purchaseType === "consolidation" && (p.behindOnBills === "yes" || m.disposable <= 0)) reasons.push("Consolidating while already behind can stretch the debt for longer and cost more overall.");
  return {
    stop: reasons.length > 0,
    headline: "New finance may not be the best next step.",
    reasons,
    help: FREE_DEBT_HELP,
  };
}

// ---------- CREDIT / CIRCUMSTANCE PROFILE ----------

const FACTOR_TEXT = {
  missedRecent: ["Recent missed payments", "Missed payments in the last six months are often weighed heavily. Some providers set minimum clean periods in their published criteria."],
  missedOld: ["Older missed payments", "Older, isolated missed payments usually matter less than recent ones, but each provider decides."],
  defaultUnsatisfied: ["Unsettled default", "An unsettled default stays on your credit file for six years from the default date. Many mainstream lenders exclude it; some specialist providers publish criteria that may accept it."],
  defaultSettled: ["Settled default", "A settled default still shows for six years from the default date, marked as satisfied. Some providers treat settled defaults more favourably."],
  ccjUnsatisfied: ["Unsatisfied CCJ", "A County Court Judgment stays on your file for six years unless paid within one month. Ask each provider whether their criteria accept CCJs and how recent."],
  ccjSatisfied: ["Satisfied CCJ", "A satisfied CCJ still shows for six years from the judgment date, marked as satisfied."],
  insolvencyActive: ["Active IVA, DRO, trust deed or bankruptcy", "During an active debt solution you may need permission before taking new credit. Speak to your insolvency practitioner or adviser first."],
  insolvencyDone: ["Completed debt solution", "A completed IVA or discharged bankruptcy stays on your file for six years from its start. Some specialist providers publish criteria for this."],
  thinFile: ["Thin or no credit file", "Little credit history gives lenders less to go on. Being on the electoral roll and checking your file for errors can help."],
  selfEmployed: ["Self-employed", "Providers usually ask for tax calculations, tax year overviews or accounts, often for one to two years of trading."],
  newJob: ["Recent job change", "Some providers set a minimum time in employment or ask for probation to be finished."],
  benefits: ["Benefits as income", "Some providers count some benefits as income and some do not. Their published criteria should say which."],
  variable: ["Variable income", "Zero-hours, agency or commission income is often averaged over several months. Have payslips or bank statements ready."],
  recentDecline: ["Recent decline", "Several full applications in a short time leave hard searches that other lenders can see. Use soft-search eligibility checkers before applying again."],
  homeowner: ["Homeowner", "Be careful with any loan secured on your home. If you cannot repay, your home may be at risk."],
};

export function circumstanceFactors(profile) {
  const p = { ...EMPTY_PROFILE, ...(profile || {}) };
  const keys = [];
  if (p.missedPayments === "recent") keys.push("missedRecent");
  if (p.missedPayments === "older") keys.push("missedOld");
  if (p.defaults === "unsatisfied") keys.push("defaultUnsatisfied");
  if (p.defaults === "settled") keys.push("defaultSettled");
  if (p.ccj === "unsatisfied") keys.push("ccjUnsatisfied");
  if (p.ccj === "satisfied") keys.push("ccjSatisfied");
  if (p.insolvency === "active") keys.push("insolvencyActive");
  if (p.insolvency === "completed") keys.push("insolvencyDone");
  if (p.creditHistory === "thin") keys.push("thinFile");
  if (p.employment === "self-employed") keys.push("selfEmployed");
  if (p.employment === "employed" && p.employmentMonths !== "" && num(p.employmentMonths) < 6) keys.push("newJob");
  if (num(p.benefitsIncome) > 0 || p.employment === "benefits") keys.push("benefits");
  if (p.employment === "variable") keys.push("variable");
  if (p.recentDecline === "yes") keys.push("recentDecline");
  if (p.housing === "owner" && p.purchaseType === "consolidation") keys.push("homeowner");
  return keys.map((k) => ({ key: k, title: FACTOR_TEXT[k][0], detail: FACTOR_TEXT[k][1] }));
}

const ADVERSE = new Set(["missedRecent", "defaultUnsatisfied", "defaultSettled", "ccjUnsatisfied", "ccjSatisfied", "insolvencyDone", "thinFile"]);

export function isSpecialist(profile) {
  return circumstanceFactors(profile).some((f) => ADVERSE.has(f.key));
}

// ---------- PURCHASE TYPE / ROUTING ----------

export const ROUTES = {
  personal: { name: "Personal loan", compare: ["APR", "total repayable", "arrangement fees", "term", "early-settlement charge"], ask: ["Is this rate guaranteed or representative?", "Can I check eligibility with a soft search first?", "What is the settlement charge if I repay early?"] },
  car: { name: "Car finance (HP or PCP)", compare: ["HP or PCP", "cash price", "deposit", "monthly payment", "final/balloon payment", "mileage limit and excess charge", "fees", "who owns the car and when"], ask: ["Is this hire purchase or personal contract purchase?", "What is the optional final payment, and what happens if I don't pay it?", "Is the dealer paid commission by the lender, and does it change my rate?", "What is the total amount payable including deposit?"] },
  card: { name: "Credit card", compare: ["purchase APR", "promotional period", "rate after the promotion", "fees", "credit limit"], ask: ["What rate applies after the promotional period?", "Will a late payment end the promotional rate?"] },
  consolidation: { name: "Debt consolidation", compare: ["total cost of old debts vs new loan", "term", "fees", "whether the loan is secured"], ask: ["Is this loan secured on my home?", "Does a lower monthly payment mean I pay more overall?"] },
  retail: { name: "Retail / buy now pay later", compare: ["whether it is regulated credit", "interest after any 0% period", "late fees", "credit file reporting"], ask: ["Is this agreement regulated by the FCA?", "Does it report to credit reference agencies?", "What happens if I miss a payment?"] },
  other: { name: "Something else", compare: ["APR", "total repayable", "fees", "term"], ask: ["What exactly is the product, and is it regulated?"] },
};

export function routeAdvice(profile) {
  const p = { ...EMPTY_PROFILE, ...(profile || {}) };
  const route = ROUTES[p.purchaseType] || ROUTES.other;
  const specialist = isSpecialist(p);
  const steps = [
    "Check your own credit report first (statutory reports are free from the main credit reference agencies).",
    "Use soft-search eligibility checkers. They do not leave a mark other lenders can see.",
    "Only make a full application to one provider at a time, after you have compared total cost.",
  ];
  if (specialist) steps.splice(1, 0, "Look for providers whose published criteria may accommodate your circumstances. Ignore anyone offering guaranteed approval.");
  return { ...route, specialist, steps };
}

// ---------- QUOTE COMPARISON ----------
// Ranking never uses commission. Default order: affordability fit → APR → total → fees → deposit → final payment.

export function analyseQuote(q, budget = 0) {
  const amount = num(q.amount);
  const monthly = num(q.monthly);
  const n = Math.round(num(q.payments, { max: 600 }));
  const deposit = num(q.deposit);
  const fees = num(q.fees);
  const balloon = num(q.balloon);
  const totalRepayable = monthly * n + balloon + fees;
  const totalCash = totalRepayable + deposit;
  const costOfCredit = totalRepayable - amount;
  const fits = budget > 0 ? monthly <= budget : null;
  const problems = [];
  if (!amount) problems.push("Amount financed is missing.");
  if (!monthly || !n) problems.push("Monthly payment or number of payments is missing.");
  if (amount && monthly && n && costOfCredit < 0) problems.push("The payments add up to less than the amount financed. Check the figures with the provider.");
  return {
    ...q,
    amount, monthly, n, deposit, fees, balloon,
    apr: q.apr === "" || q.apr === undefined ? null : num(q.apr, { max: 1000 }),
    totalRepayable: round2(totalRepayable), totalCash: round2(totalCash), costOfCredit: round2(costOfCredit),
    fits, problems, label: LABELS.estimate,
  };
}

const SORTS = {
  suitability: (a, b) => (b.fits === true) - (a.fits === true) || (a.apr ?? 1e9) - (b.apr ?? 1e9) || a.totalRepayable - b.totalRepayable || a.fees - b.fees || a.deposit - b.deposit || a.balloon - b.balloon,
  apr: (a, b) => (a.apr ?? 1e9) - (b.apr ?? 1e9),
  total: (a, b) => a.totalCash - b.totalCash,
  monthly: (a, b) => a.monthly - b.monthly,
  fees: (a, b) => a.fees - b.fees,
};

export function compareQuotes(quotes, budget = 0, sort = "suitability") {
  const list = (quotes || []).map((q) => analyseQuote(q, budget));
  return list.sort(SORTS[sort] || SORTS.suitability);
}

// ---------- PROVIDER DATA MODEL ----------

export const PROVIDER_FIELDS = [
  "provider_id", "legal_name", "trading_name", "provider_type", "fca_status", "fca_reference", "product_type",
  "minimum_amount", "maximum_amount", "term_range", "representative_apr", "total_repayment", "fees",
  "deposit_requirement", "final_payment", "eligibility_criteria", "soft_search_available", "hard_search_warning",
  "commission_disclosure", "source_url", "last_verified", "review_sources", "review_summary", "review_date", "status",
];
const REQUIRED_FOR_DISPLAY = ["provider_id", "legal_name", "provider_type", "fca_status", "product_type", "representative_apr", "eligibility_criteria", "source_url", "last_verified"];
const PROVIDER_TYPES = new Set(["lender", "broker", "credit-broker", "comparison-service", "retailer-introducer"]);

// Returns { ok, status, problems, provider }. status: verified | stale | incomplete | invalid
export function validateProvider(raw, now = Date.now()) {
  const problems = [];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { ok: false, status: "invalid", problems: ["Not a provider record."], provider: null };
  for (const f of REQUIRED_FOR_DISPLAY) if (raw[f] === undefined || raw[f] === null || raw[f] === "") problems.push(`Missing ${f}.`);
  if (raw.provider_type && !PROVIDER_TYPES.has(raw.provider_type)) problems.push("Unknown provider_type.");
  if (raw.fca_status === "authorised" && !/^\d{6,7}$/.test(String(raw.fca_reference || ""))) problems.push("FCA status says authorised but there is no valid FCA reference number.");
  let url = null;
  try { url = new URL(String(raw.source_url || "")); if (url.protocol !== "https:") problems.push("source_url must be https."); } catch { problems.push("source_url is not a valid link."); }
  const verified = Date.parse(raw.last_verified);
  if (Number.isNaN(verified)) problems.push("last_verified is not a date.");
  const ageDays = Number.isNaN(verified) ? Infinity : (now - verified) / 86400000;
  let status = "verified";
  if (problems.length) status = problems.some((p) => p.startsWith("Missing") || p.includes("FCA")) ? "incomplete" : "invalid";
  else if (ageDays > PROVIDER_MAX_AGE_DAYS) status = "stale";
  const provider = Object.fromEntries(PROVIDER_FIELDS.map((f) => [f, raw[f] ?? null]));
  return { ok: status === "verified", status, problems, provider, ageDays: Number.isFinite(ageDays) ? Math.floor(ageDays) : null };
}

// Commission never changes the order; it is only disclosed.
export function rankProviders(records, profile) {
  const affordable = affordability(profile);
  return (records || [])
    .map((r) => validateProvider(r))
    .filter((v) => v.ok)
    .map((v) => {
      const p = v.provider;
      const inRange = affordable.borrow ? affordable.borrow >= num(p.minimum_amount) && (!num(p.maximum_amount) || affordable.borrow <= num(p.maximum_amount)) : null;
      return { ...p, inRange, ageDays: v.ageDays };
    })
    .sort((a, b) => (b.inRange === true) - (a.inRange === true) || num(a.representative_apr, { max: 1000 }) - num(b.representative_apr, { max: 1000 }));
}

// ---------- "WHY DID I FAIL?" REPORT ----------

export function declineReport(input, profile) {
  const d = input || {};
  const p = { ...EMPTY_PROFILE, ...(profile || {}) };
  const provider = String(d.provider || "the provider").slice(0, 120);
  const told = String(d.told || "").trim().slice(0, 2000);
  const factors = circumstanceFactors(p);
  const a = affordability(p);
  const known = [`${provider} has ${d.outcome === "referred" ? "referred" : "declined"} the application.`];
  if (told) known.push(`What ${provider} told you: “${told}”`);
  if (d.search === "hard") known.push("It was a full application, so a hard search is likely on your credit file.");
  if (d.search === "soft") known.push("It was an eligibility (soft-search) check, which other lenders cannot see.");
  if (d.date) known.push(`Date: ${String(d.date).slice(0, 10)}.`);

  const unknown = [
    `${provider}'s private underwriting decision and scoring.`,
    "Exactly which factor, or mix of factors, led to the outcome.",
    "What the credit reference agency data they used actually showed.",
  ];

  const possible = factors.filter((f) => f.key !== "homeowner").map((f) => `${f.title}: this may be one factor. ${provider} needs to confirm the actual reason.`);
  if (a.level === "over" || a.level === "tight") possible.push("Affordability: on your own figures the payment is tight or does not fit. Lenders must check affordability.");
  if (num(p.amount) && num(p.price) && num(p.deposit) === 0 && p.purchaseType === "car") possible.push("No deposit: some providers require one for vehicle finance.");
  possible.push("Information mismatch: a different address, income or job title from what your credit file or bank statements show.");
  possible.push("Errors on your credit file, or not being on the electoral roll at your current address.");

  return {
    title: "Why did I fail? — your report",
    disclaimer: `We cannot see ${provider}'s private underwriting decision. Nothing below is the confirmed reason unless ${provider} told you so.`,
    known, unknown, possible,
    ask: [
      "Can you tell me the main reason my application was declined?",
      "Which credit reference agency did you use? (You are entitled to be told if the decision was based on credit reference agency information.)",
      "Was the decision about affordability, credit history, identity checks, or your lending criteria?",
      "Is there anything in my application you could not verify?",
      "Would a different amount, term or deposit change the outcome?",
    ],
    documents: ["Check the income figure you gave matches your payslips or tax documents.", "Check your address history matches your bank statements and credit file.", "Check employment start date and job title are accurate."],
    creditChecks: ["Get your statutory credit report from Experian, Equifax and TransUnion.", "Look for accounts you do not recognise, wrong addresses, or wrongly recorded missed payments. You can ask for errors to be corrected.", "Check you are on the electoral roll at your current address.", "Remove financial links to ex-partners you no longer share finances with (ask the agency for a notice of disassociation)."],
    affordability: a.payment ? `On your figures the payment is ${a.payment.toFixed(2)} a month and leaves ${a.remaining.toFixed(2)} a month after essentials and existing credit. ${LABELS.estimate} only.` : "Add your figures in the profile to see an affordability check.",
    change: ["Correct any errors on your credit file.", "Register on the electoral roll.", "Pay down existing balances where you can.", "Save a larger deposit or borrow less.", "Wait until recent missed payments are further in the past."],
    dont: ["Do not apply again straight away with lots of other lenders. Each full application can leave a hard search.", "Never change your income, job or address details to get accepted. That is fraud.", "Never use fake or edited documents.", "Do not hide existing debts.", "Avoid anyone promising guaranteed approval or asking for an upfront fee."],
    next: routeAdvice(p).steps,
    waitIf: ["you have made another full application in the last few weeks", "your credit file shows errors you have not yet disputed", "the payment does not fit your own budget", "you are behind on existing payments"],
    safety: difficultyCheck(p),
  };
}

// ---------- DOCUMENT ENGINE ----------
// Truthful summaries built ONLY from what the user typed. Never evidence, never approvals.

const gbp = (n) => "£" + round2(n).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const line = (k, v) => `${k}: ${v === "" || v === null || v === undefined ? "not given" : v}`;

export const DOCUMENT_TYPES = {
  checklist: "Application checklist",
  cover: "Factual cover note",
  income: "Income summary",
  expenditure: "Expenditure summary",
  requirement: "Finance requirement summary",
  purchase: "Vehicle / purchase summary",
  lenderQs: "Questions for the lender",
  brokerQs: "Questions for a broker",
  comparison: "Comparison summary",
  decision: "Decision record",
  evidence: "Evidence checklist",
};

export const FORBIDDEN_DOCUMENTS = ["payslips", "bank statements", "proof of address", "employment letters", "identity documents", "lender approvals", "references", "credit reports", "signatures", "underwriting decisions"];

export function buildDocument(type, { profile, ready = [], quotes = [], note = "", decision = "" } = {}) {
  const p = { ...EMPTY_PROFILE, ...(profile || {}) };
  const a = affordability(p);
  const route = ROUTES[p.purchaseType] || ROUTES.other;
  const stamp = new Date().toISOString().slice(0, 10);
  const head = `${DOCUMENT_TYPES[type] || "Document"} — prepared ${stamp}\nPrepared by the applicant using the Sane Finance GBT (pleadingsanity.co.uk). Every figure is the applicant's own. This is not evidence and not a lender decision.\n`;
  const evidence = ["Photo ID (passport or driving licence)", "Proof of address (recent utility bill or bank statement)", p.employment === "self-employed" ? "SA302 tax calculations or tax year overviews, or accounts" : "Recent payslips", "Recent bank statements", "Details of existing credit agreements"];
  if (num(p.benefitsIncome) > 0 || p.employment === "benefits") evidence.push("Benefit award letter or statement");
  if (p.purchaseType === "car") evidence.push("Vehicle details: registration, mileage, cash price");
  const body = {
    checklist: () => [`Purpose: ${p.purpose || route.name}`, "", "Documents ready:", ...(ready.length ? ready.map((d) => "  [x] " + d) : ["  none ticked yet"]), "", "Before applying:", "  [ ] Credit report checked for errors", "  [ ] On the electoral roll", "  [ ] Soft-search eligibility checked", "  [ ] Total cost compared, not just monthly payment", "  [ ] Provider checked on the FCA Register"].join("\n"),
    cover: () => [`To whom it may concern,`, "", `I am applying for ${route.name.toLowerCase()}${p.purpose ? " for " + p.purpose : ""}.`, a.borrow ? `I would like to borrow ${gbp(a.borrow)} over ${a.term} months${a.deposit ? `, with a deposit of ${gbp(a.deposit)}` : ""}.` : "", a.income ? `My total monthly income is ${gbp(a.income)}.` : "", note ? "\n" + note.trim() : "", "", "All information I have given is true and I can provide evidence on request.", "", "Signed: ____________________   (sign yourself — never let anyone sign for you)"].filter((x) => x !== "").join("\n"),
    income: () => [line("Main income", num(p.income) ? `${gbp(p.income)} (${p.incomeFrequency})` : ""), line("Monthly equivalent", gbp(toMonthly(p.income, p.incomeFrequency))), line("Other income per month", num(p.otherIncome) ? gbp(p.otherIncome) : ""), line("Benefits per month", num(p.benefitsIncome) ? gbp(p.benefitsIncome) : ""), line("Employment", p.employment), line("Time in current job (months)", p.employmentMonths), line("Years self-employed", p.employment === "self-employed" ? p.selfEmployedYears : "n/a"), line("Total monthly income", gbp(a.income))].join("\n"),
    expenditure: () => [line("Essential spending per month", gbp(a.essentials)), line("Existing credit repayments per month", gbp(a.commitments)), line("Total outstanding debt", num(p.totalDebt) ? gbp(p.totalDebt) : ""), line("Left after essentials and credit", gbp(a.disposable))].join("\n"),
    requirement: () => [line("Product", route.name), line("Purpose", p.purpose), line("Purchase price", a.price ? gbp(a.price) : ""), line("Deposit", gbp(a.deposit)), line("Amount to borrow", gbp(a.borrow)), line("Term (months)", a.term), line("Preferred monthly payment", num(p.preferredMonthly) ? gbp(p.preferredMonthly) : ""), line(`Estimated payment (${LABELS.estimate})`, a.payment ? gbp(a.payment) : ""), line("Estimated total repayable", a.payment ? gbp(a.totalRepayable) : "")].join("\n"),
    purchase: () => [line("Item", p.purpose), line("Cash price", a.price ? gbp(a.price) : ""), ...(p.purchaseType === "car" ? [line("Registration", p.vehicleReg), line("Vehicle age (years)", p.vehicleAge), line("Current mileage", p.vehicleMileage), line("Expected annual mileage", p.annualMileage)] : [])].join("\n"),
    lenderQs: () => ["1. Can I check eligibility with a soft search first?", "2. Is the rate you show me the rate I will get, or a representative rate?", "3. What is the total amount payable, including all fees?", "4. Is there a final or balloon payment?", "5. What is the early-settlement charge?", "6. Is the agreement regulated by the FCA, and what is your FCA reference number?", ...route.ask.map((q, i) => `${i + 7}. ${q}`)].join("\n"),
    brokerQs: () => ["1. Are you a broker or a lender? What is your FCA reference number?", "2. How many lenders do you work with? Is it the whole market or a panel?", "3. Are you paid commission? How much, and does it vary by lender or by the rate I get?", "4. Do you charge me a fee? (Brokers must tell you before charging.)", "5. Will you do a soft search or a hard search?", "6. Can I see the lender's own pre-contract information before I commit?"].join("\n"),
    comparison: () => {
      const list = compareQuotes(quotes, num(p.preferredMonthly) || Math.max(0, a.cautiousCeiling));
      if (!list.length) return "No quotes added yet.";
      return list.map((q, i) => `${i + 1}. ${q.provider || "Unnamed quote"} — ${gbp(q.monthly)} x ${q.n}, APR ${q.apr ?? "not given"}%, total payable ${gbp(q.totalCash)}, cost of credit ${gbp(q.costOfCredit)}${q.commission ? `, commission disclosed: ${q.commission}` : ""}${q.fits === false ? " (above budget)" : ""}`).join("\n");
    },
    decision: () => [line("Date", stamp), line("What I decided", decision), line("Why", note), "", "I made this decision myself after comparing total cost."].join("\n"),
    evidence: () => evidence.map((e) => `[ ] ${e} — original, unedited`).join("\n") + "\n\nNever edit, create or borrow a document. Providers check, and false documents are fraud.",
  };
  return head + "\n" + (body[type] ? body[type]() : "Unknown document type.");
}

// ---------- APPLICATION TRACKER ----------

export const TRACKER_STATUSES = ["Researching", "Eligibility checked", "Ready to apply", "Applied", "Documents requested", "Documents supplied", "Referred", "Approved", "Declined", "Withdrawn", "Completed"];

export function cleanTrackerEntry(e) {
  const s = (v, n) => String(v ?? "").slice(0, n);
  return {
    id: s(e.id, 40) || Math.random().toString(36).slice(2, 10),
    provider: s(e.provider, 120),
    status: TRACKER_STATUSES.includes(e.status) ? e.status : "Researching",
    date: /^\d{4}-\d{2}-\d{2}$/.test(e.date || "") ? e.date : new Date().toISOString().slice(0, 10),
    quote: s(e.quote, 200),
    totalCost: num(e.totalCost),
    decision: s(e.decision, 300),
    notes: s(e.notes, 2000),
  };
}

// ---------- OUTPUT ENCODING ----------

export function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}
