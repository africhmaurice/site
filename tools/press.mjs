// node tools/press.mjs : builds pages/press.html (the Press page) and pages/home-press.html (the home page media section)
// from the lists below. To add a feature or change a contact: edit FEATURES or CONTACTS, run this, then npm run publish.
import { writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'https://africhmaurice.github.io/site/';
const HEADSHOT = 'https://images.squarespace-cdn.com/content/v1/68f0178dd88a7e52ec46ae7e/3ca8075d-3c26-4716-8330-52ed5d5b60e9/Maurice+Headshot.jpg';

// Best first. home: true puts it on the home page too. quote: a short pull quote from the piece (keep them short).
const FEATURES = [
  { home: true, outlet: 'Kirkus Reviews', type: 'Review', title: 'Cello’s Gate: The Sky Pirates of Imperia', date: 'Aug 2026',
    quote: 'Readers should enjoy this thinly veiled literary love letter to pop-culture SF.',
    url: 'https://www.kirkusreviews.com/book-reviews/maurice-africh/cellos-gate-the-sky-pirates-of-imperia/' },
  { home: true, outlet: 'Library Journal', type: 'Review', title: 'Cello’s Gate', date: '2026',
    url: 'https://www.libraryjournal.com/review/cellos-gate-100013820' },
  { home: true, outlet: 'Collider', type: 'List', title: '8 Sci-Fi Books That Are Perfect From Cover to Cover', date: 'Aug 2026',
    quote: '…absolutely great read that cannot be missed.',
    url: 'https://collider.com/sci-fi-books-perfect-cover-to-cover/' },
  { home: true, outlet: 'Collider', type: 'List', title: '10 Essential Sci-Fi Books for Beginners', date: 'Aug 2026',
    quote: 'Heart-filled, fun, and filled with great worldbuilding.',
    url: 'https://collider.com/essential-sci-fi-books-beginners/' },
  { home: true, outlet: 'Grimdark Magazine', type: 'Review', title: 'Review: Cello’s Gate by Maurice Africh', date: 'Mar 2025',
    quote: 'Epic yet intimate, dark yet lighthearted.',
    url: 'https://www.grimdarkmagazine.com/review-cellos-gate-by-maurice-africh/' },
  { home: true, outlet: 'Nyrdcast', type: 'Review', title: 'Cello’s Gate by Maurice Africh: A Book Review', date: 'Sep 2026',
    quote: 'An entertaining ride that kept me turning pages.',
    url: 'https://www.nyrdcast.com/cellos-gate-maurice-africh-review/' },
  { home: true, outlet: 'The Smitty Review', type: 'Video', title: 'Cello’s Gate on TikTok', date: '2025',
    quote: 'The most fun I’ve had reading this year.',
    url: 'https://www.tiktok.com/@vinopapi23/video/7550804683011411214' },
  { home: true, outlet: 'On Wednesdays We Read', type: 'Podcast', title: 'Author Highlight: Maurice Africh', date: 'Mar 2025',
    url: 'https://owwrpod.com/2025/03/25/author-highlight-maurice-aufrich/' },
  { outlet: 'This Dad Reads', type: 'Review', title: 'Cello’s Gate Book Review', date: 'Jun 2026',
    quote: 'An impressive debut and exactly the kind of pure popcorn entertainment.',
    url: 'https://thisdadreads.wordpress.com/2026/06/15/cellos-gate-book-review/' },
  { outlet: 'BookMadLibrarian', type: 'Review', title: 'Cello’s Gate by Maurice Africh', date: 'Jul 2025',
    quote: 'One of the best debut novels I’ve read in a while.',
    url: 'https://bookmadlibrarian.wordpress.com/2025/07/07/cellos-gate-by-maurice-africh/' },
  { outlet: 'Dark Shelf of Wonders', type: 'Review', title: 'Cello’s Gate by Maurice Africh', date: 'Apr 2025',
    url: 'https://darkshelfofwonders.com/cellos-gate-maurice-africh-review/' },
  { outlet: 'Fade to Obsidian', type: 'Podcast', title: 'Discussing Cello’s Gate with Maurice Africh', date: '2025',
    url: 'https://www.youtube.com/watch?v=jth1AgyV9ps' },
  { outlet: 'Daniel Coolbaugh', type: 'Interview', title: 'Season 4, Episode 49: Maurice Africh Interview', date: '2025',
    url: 'https://www.youtube.com/watch?v=q2JejVp7lXI' },
  { outlet: 'A Conversation With…', type: 'Interview', title: 'Maurice Africh, Author of Cello’s Gate', date: '2025',
    url: 'https://www.youtube.com/watch?v=YSuh8yYblAU' },
];

// email: null shows the card with a "coming soon" note instead of a button.
const CONTACTS = [
  { role: 'Literary Agent', name: 'Merrilee Heifetz', org: 'Writers House', note: 'Rights, film and TV, and foreign editions.', email: 'mheifetz@writershouse.com' },
  { role: 'Publicity, U.S.', name: 'Christine Calella', org: 'Simon & Schuster', note: 'Review copies, interviews, and events in North America.', email: 'christine.calella@simonandschuster.com' },
  { role: 'Publicity, UK', name: 'George Biggs', org: 'Hodderscape', note: 'Review copies, interviews, and events in the UK and Commonwealth.', email: 'George.Biggs@hodder.co.uk' },
  { role: 'Maurice', name: 'Maurice Africh', org: 'Author', note: 'Podcasts, blogs, BookTok, and everything else.', email: 'mauriceafrich@secondworldbooks.com' },
];
const SUBJECT = 'Press inquiry: Cello’s Gate';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const host = (u) => new URL(u).hostname.replace(/^www\./, '');

const card = (f) => `
      <a class="pr-card" href="${esc(f.url)}" target="_blank" rel="noopener">
        <span class="pr-meta"><span class="pr-type pr-${f.type.toLowerCase()}">${esc(f.type)}</span><span>${esc(f.date)}</span></span>
        <span class="pr-outlet">${esc(f.outlet)}</span>
        <span class="pr-title">${esc(f.title)}</span>${f.quote ? `
        <span class="pr-quote">“${esc(f.quote)}”</span>` : ''}
        <span class="pr-go">${{ Podcast: 'Listen', Video: 'Watch', Interview: 'Watch' }[f.type] || 'Read'} on ${esc(host(f.url))} →</span>
      </a>`;

// Shared card styles, scoped by the wrapper id.
const cardCss = (id) => `
${id} .pr-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:18px}
${id} .pr-card{display:flex;flex-direction:column;gap:10px;padding:22px 22px 20px;background:rgba(11,23,15,.9);border:1px solid rgba(255,255,254,.16);color:#fffffe;text-decoration:none;transition:transform .18s ease,border-color .18s ease,background .18s ease}
${id} .pr-card:hover{transform:translateY(-4px);border-color:#3adb97;background:rgba(26,94,65,.55)}
${id} .pr-meta{display:flex;justify-content:space-between;align-items:center;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,254,.6)}
${id} .pr-type{font-weight:800;padding:4px 9px;border:1px solid currentColor}
${id} .pr-review{color:#fd7547}${id} .pr-list{color:#a2f590}${id} .pr-podcast,${id} .pr-interview{color:#9e74fd}${id} .pr-video{color:#89fbcb}
${id} .pr-outlet{font-weight:800;font-size:13px;letter-spacing:.16em;text-transform:uppercase;color:#3adb97}
${id} .pr-title{font-weight:700;font-size:18px;line-height:1.35}
${id} .pr-quote{font-size:15px;line-height:1.55;color:rgba(255,255,254,.82);font-style:italic}
${id} .pr-go{margin-top:auto;padding-top:6px;font-size:13px;font-weight:700;letter-spacing:.05em;color:#fd7547}`;

const fonts = `<link rel="stylesheet" href="https://use.typekit.net/hfm0eub.css">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Almarai:wght@400;700;800&display=swap" rel="stylesheet">`;

// ---------- Home page media section ----------
const homeList = FEATURES.filter((f) => f.home);
const home = `<!-- Generated by tools/press.mjs; edit the lists there, not this file. -->
${fonts}
<style>
#home-press{box-sizing:border-box;font-family:'Almarai',sans-serif;letter-spacing:.03em;color:#fffffe;max-width:1180px;margin:0 auto;padding:8px 0}
#home-press *,#home-press *::before,#home-press *::after{box-sizing:border-box}
#home-press .hp-head{text-align:center;margin:0 0 26px}
#home-press .hp-kicker{font-weight:800;font-size:13px;letter-spacing:.18em;color:#a2f590;margin:0}
${cardCss('#home-press')}
#home-press .hp-more{text-align:center;margin:28px 0 0}
#home-press .hp-btn{display:inline-block;color:#fffffe;text-decoration:none;font-weight:700;font-size:15px;letter-spacing:.08em;text-transform:uppercase;border:1.5px solid #fffffe;padding:13px 26px;background:rgba(11,23,15,.9);transition:background .15s ease,transform .15s ease}
#home-press .hp-btn:hover{background:#c53200;transform:scale(1.04)}
@media (max-width:640px){#home-press .pr-grid{grid-template-columns:1fr}#home-press .pr-card{padding:18px}}
</style>
<div id="home-press">
  <div class="hp-head"><p class="hp-kicker">AS FEATURED IN</p></div>
  <div class="pr-grid">${homeList.map(card).join('')}
  </div>
  <p class="hp-more"><a class="hp-btn" href="/press-kit">All press and media contacts →</a></p>
</div>
`;

// ---------- Press page ----------
const contact = (c) => `
      <div class="pp-contact">
        <p class="pp-role">${esc(c.role)}</p>
        <p class="pp-name">${esc(c.name)}</p>
        <p class="pp-org">${esc(c.org)}</p>
        <p class="pp-note">${esc(c.note)}</p>
        ${c.email
          ? `<a class="pp-btn" href="mailto:${esc(c.email)}?subject=${encodeURIComponent(SUBJECT)}">Email ${esc(c.role === 'Maurice' ? 'me' : c.name.split(' ')[0])}</a><span class="pp-addr">${esc(c.email)}</span>`
          : `<span class="pp-soon">Email coming soon</span>`}
      </div>`;

const KIT_IMAGES = [
  ['cover-saga-floating.webp', 'Cello’s Gate, Saga Press hardcover', 'Book cover'],
  ['cover-walmart-floating.webp', 'Cello’s Gate, Walmart Special Edition', 'Walmart Special Edition'],
  ['author-photo.webp', 'Maurice Africh', 'Author photo'],
];
const DESCRIPTION = [
  '<p class="pp-lead">With a wit to rival Matt Dinniman’s Dungeon Crawler Carl, action on par with Pierce Brown’s Red Rising, and the scope of Tamsyn Muir’s Gideon the Ninth, Cello’s Gate is a rollicking, edge-of-your-seat sci-fi fantasy epic about a ragtag crew of rogues on the hunt for mythic treasure. They did not, however, sign up to save the world.</p>',
  '<p>Captain Grey and his crew of sky pirates have a reputation for doing the impossible. From breaking into high-security military research facilities to conning the iCity elite—there isn’t a lock they can’t pick, a safe they can’t break, or a hidden treasure they can’t find. <i>Until now.</i></p>',
  '<p>Returning from a harrowing heist involving a neon battery and a trash chute, Grey and his crew are approached by Dalia, the immortal daughter of the infamous ArchGovernor—and she has an offer.</p>',
  '<p>The job? Locate and steal the Stones of Indigo—seven fabled rocks invested with godlike power. The search for the first stone is a bona fide treasure hunt, guided by an ancient map to a deadly, uncharted island that’s protected by a mysterious guardian. The score? One million credits per crew member, per stone. The catch? Well, that’s where things get a little complicated.</p>',
  '<p>The stones don’t exist. They’re a myth. A bedtime story told to little pirates to make them believe that power and wealth are attainable if you just work hard enough.</p>',
  '<p>And to make matters infinitely worse, Grey’s never trusted immortals, and Dalia’s definitely hiding something. Something bad. And if they don’t figure out what it is, it might cost them their lives.</p>',
  '<p class="pp-tag">ONE CREW OF SKY PIRATES<br>SEVEN MYTHOLOGICAL STONES<br>A RACE TO FIND THEM ALL</p>',
].join('');
// [quote, name, book or handle, isHandle]
const PRAISE = [
  ['This stellar debut is exactly the kind of book I love to read. It’s got scheming immortals, a perilous quest, and a ragtag band of eclectic, eccentric, exceedingly dangerous misfits setting out on a grand adventure. And did I mention the monsters? The skyships? The witty banter? Wait, are we sure I didn’t write this myself? This one’s a must-read, and I can’t wait to see where it goes from here.', 'NICHOLAS EAMES', 'KINGS OF THE WYLD'],
  ['The very definition of rip-roaring.', 'RICHARD SWAN', 'THE JUSTICE OF KINGS'],
  ['The most fun I’ve had reading this year.', 'SMITTY', '@smitty1423', true],
  ['Fun and thrilling with a cast of memorable characters. It’s hard to find a stronger debut novel.', 'AARON N. HALL', 'THE LEGEND OF UH'],
  ['Maurice has made fantasy fun again, and I cannot get enough of it. Cello’s Gate is the best debut I have ever read and it’s not even close. He took everything I love about fantasy and put it in one book.', 'NOAH BRISK', 'THE TETHERED GOD'],
  ['A spellbinding blend of found family, epic heisting, and murder-full suspense!', 'ANDY PELOQUIN', 'DARKBLADE'],
];
const FACTS = [
  ['Title', 'Cello’s Gate'],
  ['Series', 'The Sky Pirates of Imperia'],
  ['Genre', 'Science Fantasy Adventure'],
  ['Release', 'November 3, 2026'],
  ['U.S.', 'Saga Press · Hardcover ISBN 9781668242834'],
  ['UK', 'Hodderscape · Hardback ISBN 9781399763073'],
  ['Audio', 'Simon Maverick'],
  ['Goodreads', '25,658 want to read · 4.28 average from 1,085 ratings (September 28, 2026)'],
  ['Home', 'Asheville, North Carolina'],
];

// The Hunt section. DRAFT copy for Maurice to rewrite. Update STATS (and STATS_DATE) before each round of pitches.
const HUNT_LEDE = 'From September 20th to November 1st, hundreds of readers from around the world are searching for treasure hidden all over the internet. I’ve partnered with 20+ Bookstagram, Booktok, and Booktube influencers—as well as journalists, friends, and complete strangers—to make this campaign as far-reaching and complex as possible while maintaining the core tenet of my brand:';
const HUNT_MOTTO = 'It’s gotta be fun.';
const HUNT_HOW = 'The hunt is broken into three acts that follow a fully-interactive <b>Choose Your Own Adventure-Style Game &amp; Narrative</b> (hosted on my website). Treasure hunters solve riddles, follow clues, play daily bookish games, hunt down hidden loot boxes (like feral animals, mind you), and vote on where the story goes next. There are three ways to win:';
const HUNT_WAYS = [
  ['Opportunity & Chance', 'Each act ends with a Sweepstakes, where all (U.S. & U.K.) participants are eligible to win awards. The Act One Sweepstakes will award 10 individuals a Signed Deluxe Edition of “Cello’s Gate.” And the sweepstakes rewards just get better as we progress through the hunt.'],
  ['Effort & Dedication', 'Six treasure hunters (3 in the U.S. & 3 in the U.K.) with the most points at the end of the hunt will win a Treasure Box filled with bookish prizes.'],
  ['Participation', 'During each act, the hunters will work together to collectively earn points to unlock rewards. There are 20+ rewards available during the hunt, including exclusive short stories, never-before-seen character back stories, new games and opportunities to earn points, and more!'],
];
// Maurice's words, verbatim. One string per paragraph.
const HUNT_QUOTE = [
  'I spent my entire life waiting for someone to open a door for me, thinking that was something I was entitled to, for some reason. And then I realized that everyone with a key to a door worth opening didn’t know my name. They had no stake in my story. So I endeavored to change that.',
  'I worked myself to the bone, hired two world-class editors, went to market on a six-month marketing strategy, and sold a lot of books. And then people started knowing my name. That’s when Simon Maverick came to me with an offer which I took to Merrilee Heifetz of Writers House, who took it to Saga Press, who waved me in with such ease, it was like there was never a door at all.',
  'That’s why I built this treasure hunt. Because I thought it would be fun (which is a cornerstone of my brand), I thought it would help us sell a lot of books, and I thought, by the end of it, a lot more people would know my name. We’ll see, huh? If nothing else, I know we’re all having a pretty damn good time.',
];
const HUNT_QUOTE_BY = 'Maurice Africh, Author of “Cello’s Gate”';
const STATS_DATE = 'October 7, 2026';
// [group title, [[big number, what it means]], wide (spans the full row, two stats per line)]
const HIGHLIGHTS = [
  ['The Headline Numbers', [
    ['412', 'Readers have joined the hunt, from 13 countries.'],
    ['7,503', 'Tasks completed: posts, riddles, games, and finds.'],
    ['414,340', 'Points earned by the crew together. Act One beat its 40,000 goal five times over, and Act Two is already past its 200,000 goal.'],
    ['7,332', 'Sweepstakes entries.'],
    ['74', 'Copies of “Cello’s Gate” pre-ordered or gifted through the hunt, a month before release.'],
    ['90×', 'Website traffic: 17,359 visits since the hunt opened, about 1,000 a day, up from about 10 a day before it.'],
    ['2,563', 'New Goodreads “want to read” adds during the hunt.'],
    ['+46%', 'Discord community growth, from 171 to 249 members.'],
  ], true],
  ['Readers Doing the Marketing', [
    ['502', 'Public social posts by players: 269 “share the hunt” posts, 64 book-recommendation carousels featuring “Cello’s Gate,” 123 scorecards, 35 merch photos, and 11 Balance Challenge videos.'],
    ['60', 'Requests from readers asking 34 libraries and 26 bookstores to stock the book. Two stores have already said yes.'],
    ['77', 'Reading-app adds by 36 readers, on Goodreads, StoryGraph, Fable, and more.'],
    ['21', 'New players recruited by other players.'],
  ]],
  ['Readers Are Hooked', [
    ['2,232', 'Hidden loot boxes found, across 56 different boxes hidden around the internet.'],
    ['1,295', 'Riddles solved.'],
    ['2,197', 'Daily puzzle wins across 7 original games.'],
    ['103', 'Votes steering a live choose-your-own-adventure story set in the book’s world.'],
    ['44', 'Items bought from the merch shop.'],
    ['11', 'Pieces of fan art and fan fiction, created before the book is even out.'],
  ]],
];
const STATS = [
  ['220', 'sky pirates'],
  ['173,820', 'crew points earned'],
  ['2,850', 'sweepstakes entries'],
  ['7,101', 'site visits in the first nine days'],
];
const HUNT_FACTS = [
  ['Dates', 'September 20 to November 1, 2026. It ends two days before “Cello’s Gate” comes out.'],
  ['Where', 'mauriceafrich.com/the-hunt'],
  ['Who', 'Free and open to everyone, everywhere. The Treasure and sweepstakes prizes are for U.S. and UK residents, 18 and older.'],
  ['Players', '412 sky pirates from 13 countries: the U.S., the UK, Canada, Australia, India, Estonia, Ireland, Austria, Japan, Poland, Norway, Portugal, and Spain.'],
  ['Traffic', 'Site traffic is up about 90 times: 17,359 visits since the hunt started, about 1,000 a day, compared with about 10 a day in September before it.'],
  ['Play', 'Tasks, riddles, clues, seven daily bookish games (including Skyword, Blades & Brass, and Crest Quest), 101 hidden loot boxes, and a fan fiction contest.'],
  ['Story', 'Choose-your-own-adventure-style game with a voting and dice rolling system that determines the outcomes. The crew works together to explore the island and find the treasure. With guest appearances by Gary Furlong!'],
  ['Crew', 'Every point also counts toward a shared crew total that unlocks rewards for all players. The crew has earned 414,340 points so far. Act One blew past its 40,000 goal five times over, unlocking 50 new loot boxes and the Golden Loot Box, and Act Two has already passed its 200,000 goal.'],
  ['Acts', 'Three sweepstakes: Act One (September 21 to 30), Act Two (October 1 to 15), and Act Three (October 16 to November 1). Winners are announced the day after each act ends.'],
  ['Treasure', 'The top three on the U.S. and UK leaderboards win The Treasure: signed editions, art prints, custom bookmarks, enamel pins, an advance audiobook, and more.'],
];
// Launch events. url: the store's event or registration page (null until it's posted).
const EVENTS = [
  { date: 'Mon, Nov 2', time: '6 PM Eastern', title: 'Launch at Malaprop’s Bookstore/Cafe', place: 'In store at 55 Haywood St, Asheville, North Carolina', url: null },
  { date: 'Thu, Nov 5', time: '6 PM Pacific', title: 'Virtual event with Mysterious Galaxy', place: 'Online, hosted by Mysterious Galaxy in San Diego. Open to anyone.', url: null },
];
const eventCard = (e) => {
  const inner = `<span class="pp-ev-date">${esc(e.date)}<small>${esc(e.time)}</small></span><span class="pp-ev-title">${esc(e.title)}</span><span class="pp-ev-place">${esc(e.place)}</span>`;
  return e.url
    ? `<a class="pp-event" href="${esc(e.url)}" target="_blank" rel="noopener">${inner}<span class="pp-ev-go">Details and RSVP →</span></a>`
    : `<div class="pp-event">${inner}</div>`;
};

const HUNT_IMAGES = [
  ['hunt-welcome', 'Welcome to the Hunt'],
  ['hunt-treasure', 'The Treasure'],
  ['hunt-adventure', 'Choose Your Own Adventure'],
  ['hunt-skyword', 'Skyword daily game'],
  ['hunt-loot-boxes', 'Fifty-one loot boxes'],
];

const press = `<!-- Generated by tools/press.mjs; edit the lists there, not this file. -->
${fonts}
<style>
#press{box-sizing:border-box;position:relative;width:100vw;overflow-x:hidden;background:linear-gradient(rgba(0,0,0,.75),rgba(0,0,0,.75)),url(${BASE}assets/bg/garden-city-towers.webp) center/cover no-repeat fixed;padding-top:clamp(140px,12vw,180px);color:#fffffe;font-family:'Almarai',sans-serif;letter-spacing:.03em;padding-bottom:110px}
#press *,#press *::before,#press *::after{box-sizing:border-box}
#press .pp-wrap{max-width:1180px;margin:0 auto;padding:0 32px}
#press .pp-kicker{font-weight:700;font-size:14px;letter-spacing:.14em;color:#a2f590;margin:0 0 14px}
#press .pp-wrap > .pp-kicker{color:#fd7547}
#press h1{font-family:'Atomic Marker',cursive;font-weight:400;font-size:clamp(34px,4.4vw,64px);line-height:1;margin:0 0 20px;color:#fffffe;text-transform:none}
#press h2{font-family:'bebas-neue-pro','Bebas Neue Pro',sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:.03em;font-size:clamp(36px,3.4vw,52px);line-height:1;color:#89fbcb;margin:0 0 26px}
#press .pp-lede{font-size:clamp(16px,1.4vw,19px);line-height:1.6;color:#ede9dc;margin:0 auto;max-width:640px}
#press .pp-wrap > .pp-kicker,#press .pp-wrap > h1,#press .pp-wrap > .pp-lede{text-align:center}
#press .pp-hunt h2.pp-hunt-title{font-family:'Atomic Marker',cursive;font-weight:400;text-transform:none;letter-spacing:0;text-align:center;line-height:1.02;font-size:clamp(40px,5.2vw,72px);margin-bottom:34px}
#press .pp-hunt h2.pp-hunt-title span{display:block;white-space:nowrap}
#press .pp-hunt h2.pp-hunt-title .w{color:#fffffe;font-family:'bebas-neue-pro','Bebas Neue Pro',sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:.02em;line-height:.95;font-size:1.3em}
#press .pp-hunt h2.pp-hunt-title .pp-hunt-sub{font-family:'bebas-neue-pro',sans-serif;font-weight:600;font-size:clamp(20px,2.1vw,30px);line-height:1.15;letter-spacing:.06em;text-transform:uppercase;color:#fffffe;white-space:normal;margin-top:16px;text-wrap:balance}
#press .pp-section{margin-top:56px;padding:44px 48px 40px;background:rgba(38,142,98,.9);border:1px solid rgba(243,234,217,.18);scroll-margin-top:120px}
#press .pp-contacts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}
#press .pp-contact{display:flex;flex-direction:column;align-items:center;text-align:center;padding:28px 24px;background:rgba(11,23,15,.9);border:1px solid rgba(255,255,254,.16)}
#press .pp-contact p{margin:0}
#press .pp-role{font-weight:800;font-size:13px;letter-spacing:.16em;text-transform:uppercase;color:#fd7547;margin-bottom:12px!important}
#press .pp-name{font-weight:800;font-size:20px;line-height:1.3}
#press .pp-org{font-size:15px;color:#3adb97;margin-top:2px!important}
#press .pp-note{font-size:15px;line-height:1.55;color:rgba(255,255,254,.78);margin:14px 0 20px!important}
#press .pp-btn{margin-top:auto;display:block;text-align:center;color:#fffffe;text-decoration:none;font-weight:700;font-size:15px;letter-spacing:.06em;border:1.5px solid #fffffe;padding:12px 16px;background:rgba(12,26,8,.35);transition:background .15s ease,transform .15s ease}
#press .pp-btn:hover{background:#c53200;transform:scale(1.03)}
#press .pp-contact .pp-btn{min-width:260px}
#press .pp-addr{display:block;margin-top:10px;font-size:14px;color:rgba(255,255,254,.7);white-space:nowrap;text-align:center}
#press .pp-soon{margin-top:auto;display:block;text-align:center;font-size:14px;font-weight:700;letter-spacing:.06em;padding:12px 16px;border:1.5px dashed rgba(255,255,254,.35);color:rgba(255,255,254,.6)}
#press .pp-kit{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:48px;align-items:start}
#press .pp-imgs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;margin-bottom:36px}
#press .pp-img{display:flex;flex-direction:column;gap:10px;color:#fffffe;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:.06em}
#press .pp-img img{width:100%;aspect-ratio:4/5;object-fit:contain;display:block;border:1px solid rgba(255,255,254,.16);background:rgba(11,23,15,.9)}
#press .pp-img:last-child img{object-fit:cover}
#press .pp-desc p{font-size:16px;line-height:1.65;color:#ede9dc;margin:0 0 16px}
#press .pp-desc .pp-lead{font-weight:800;color:#fffffe}
#press .pp-desc .pp-tag{font-family:'Atomic Marker',cursive;font-weight:400;font-size:clamp(22px,2.2vw,30px);letter-spacing:.03em;color:#fffffe;line-height:1.35;text-align:center;background:rgba(11,23,15,.9);border-left:4px solid #ff4c0f;padding:12px 18px}
#press .pp-sub{font-family:'bebas-neue-pro','Bebas Neue Pro',sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:.03em;font-size:clamp(30px,2.8vw,42px);line-height:1;color:#89fbcb;margin:40px 0 20px}
#press .pp-praise{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,320px),1fr));gap:18px}
#press .pp-praise figure{margin:0;padding:22px 24px;background:rgba(11,23,15,.9);border:1px solid rgba(255,255,254,.16);display:flex;flex-direction:column;justify-content:space-between;gap:14px}
#press .pp-praise blockquote{margin:0;font-size:16px;line-height:1.6;font-style:italic;color:#fffffe}
#press .pp-praise figcaption{font-size:14px;letter-spacing:.04em;color:rgba(255,255,254,.78)}
#press .pp-praise figcaption b{color:#fd7547;letter-spacing:.08em}
#press .pp-rule{border:0;border-top:1px solid rgba(243,234,217,.25);margin:40px 0 0}
#press .pp-img span{color:#fffffe;white-space:nowrap}
#press .pp-img span b{color:#ff4c0f;font-weight:800}
#press .pp-img:hover span{color:#a2f590}
#press .pp-facts{margin:0;display:grid;grid-template-columns:130px minmax(0,1fr);gap:0}
#press .pp-facts dt{white-space:nowrap}
#press .pp-facts dt,#press .pp-facts dd{margin:0;padding:12px 0;border-top:1px solid rgba(243,234,217,.12);font-size:15px;line-height:1.5}
#press .pp-facts dt{font-weight:800;font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#a2f590;padding-top:14px}
#press .pp-bio{font-size:16px;line-height:1.65;color:#ede9dc;margin:26px 0 0}
#press .pp-hunt{background:rgba(145,37,1,.9);border-color:rgba(253,117,71,.35)}
#press .pp-hunt h2{color:#fd7547}
#press .pp-motto{font-family:'bebas-neue-pro','Bebas Neue Pro',sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:.02em;font-size:48px;line-height:1;color:#fd7547;text-align:left;margin:0 0 28px}
#press .pp-ways{margin:0 0 36px;text-align:left}
#press .pp-way{margin:0 0 26px}
#press .pp-way h3{font-family:'bebas-neue-pro','Bebas Neue Pro',sans-serif!important;font-weight:700;text-transform:uppercase;letter-spacing:.03em;font-size:44px;line-height:1;color:#fd7547;margin:0 0 8px}
#press .pp-way p{font-size:clamp(16px,1.3vw,18px);line-height:1.6;color:#ede9dc;margin:0}
#press .pp-hunt-lede b{color:#fffffe}
#press .pp-hunt-lede{font-size:clamp(16px,1.4vw,19px);line-height:1.65;color:#ede9dc;margin:0 0 28px}
#press .pp-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin:0 0 10px}
#press .pp-hl{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;margin:0 0 10px;align-items:start}
#press .pp-hl-col{display:grid;grid-template-columns:max-content minmax(0,1fr);column-gap:0;background:rgba(11,23,15,.9);border:1px solid rgba(255,255,254,.16);padding:24px 28px 10px}
#press .pp-hl-col h3{grid-column:1/-1}
#press .pp-hl-col h3{font-family:'bebas-neue-pro','Bebas Neue Pro',sans-serif!important;font-weight:700;text-transform:uppercase;letter-spacing:.03em;font-size:42px;line-height:1;color:#3adb97;margin:0 0 8px;text-align:left}
#press .pp-hl-row{display:contents}
#press .pp-hl-row b{padding-right:26px!important}
#press .pp-hl-row b,#press .pp-hl-row span{padding:16px 0;border-top:1px solid rgba(255,255,254,.12);display:flex;align-items:center}
#press .pp-hl-col h3 + .pp-hl-row b,#press .pp-hl-col h3 + .pp-hl-row span{border-top:0}
#press .pp-hl-col.wide{grid-column:1/-1;grid-template-columns:max-content minmax(0,1fr) max-content minmax(0,1fr);column-gap:0}
#press .pp-hl-col.wide .pp-hl-row span{padding-right:28px}
#press .pp-hl-col.wide h3 + .pp-hl-row + .pp-hl-row b,#press .pp-hl-col.wide h3 + .pp-hl-row + .pp-hl-row span{border-top:0}
#press .pp-hl-row b{font-family:'bebas-neue-pro','Bebas Neue Pro',sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:.02em;font-size:56px;line-height:1;color:#fffffe;text-align:left;white-space:nowrap}
#press .pp-hl-row span{font-size:16px;line-height:1.5;color:#ede9dc}
#press .pp-stat{padding:20px 18px;background:rgba(11,23,15,.9);border:1px solid rgba(255,255,254,.16);text-align:center}
#press .pp-stat b{display:block;font-family:'bebas-neue-pro','Bebas Neue Pro',sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:.02em;font-size:clamp(38px,3.8vw,56px);line-height:1.1;color:#fffffe}
#press .pp-stat span{display:block;margin-top:6px;font-size:13px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#fd7547}
#press .pp-asof{font-size:13px;color:rgba(255,255,254,.6);margin:0 0 30px}
#press .pp-quote{margin:0 0 30px;padding:4px 0 4px 22px;border-left:3px solid #ff4c0f;font-size:18px;line-height:1.6;font-style:italic;color:#fffffe}
#press .pp-quote p{margin:0 0 14px;max-width:820px}
#press .pp-quote cite{display:block;margin-top:8px;font-style:normal;font-size:14px;font-weight:700;letter-spacing:.08em;color:#fd7547}
#press .pp-hunt .pp-facts{grid-template-columns:140px minmax(0,1fr)}
#press .pp-hunt .pp-facts dt{color:#fd7547}
#press .pp-gfx{margin:30px 0 0}
#press .pp-gfx img{width:100%;height:auto;display:block;border:1px solid rgba(255,255,254,.16)}
#press .pp-gfx figcaption{margin-top:10px;font-size:14px;font-weight:700;letter-spacing:.06em}
#press .pp-gfx figcaption a{color:#fd7547;text-decoration:none}
#press .pp-gfx figcaption a:hover{color:#3adb97}
#press .pp-phones{display:flex;gap:16px;overflow-x:auto;padding:30px 0 10px;scroll-snap-type:x mandatory}
#press .pp-phone{flex:0 0 180px;scroll-snap-align:start;display:flex;flex-direction:column;gap:8px;color:#fffffe;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:.04em}
#press .pp-phone img{width:100%;height:auto;display:block;border:1px solid rgba(255,255,254,.16)}
#press .pp-phone span{color:#fd7547}
#press .pp-phone:hover span{color:#3adb97}
#press .pp-cta{display:flex;flex-wrap:wrap;gap:12px;margin-top:26px}
#press .pp-cta .pp-btn{display:inline-block;margin:0;padding:12px 22px}
#press .pp-events{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,400px),1fr));gap:18px}
#press .pp-event{display:grid;grid-template-columns:auto minmax(0,1fr);gap:6px 20px;align-content:start;padding:22px 24px;background:rgba(11,23,15,.9);border:1px solid rgba(255,255,254,.16);color:#fffffe;text-decoration:none}
#press a.pp-event:hover{border-color:#3adb97}
#press .pp-ev-date{grid-row:span 3;font-family:'Atomic Marker',cursive;font-size:26px;line-height:1.1;color:#fd7547;min-width:88px}
#press .pp-ev-date small{display:block;font-family:'Almarai',sans-serif;font-size:13px;font-weight:700;letter-spacing:.08em;color:rgba(255,255,254,.7);margin-top:6px}
#press .pp-ev-title{font-weight:800;font-size:18px;line-height:1.3}
#press .pp-ev-place{font-size:15px;line-height:1.5;color:rgba(255,255,254,.78)}
#press .pp-ev-go{font-size:13px;font-weight:700;letter-spacing:.05em;color:#3adb97}
${cardCss('#press')}
@media (max-width:860px){
  #press .pp-imgs{grid-template-columns:1fr 1fr}
  #press .pp-stats{grid-template-columns:1fr 1fr}
  #press .pp-hl{grid-template-columns:1fr}
  #press .pp-hl-col.wide{grid-template-columns:max-content minmax(0,1fr)}
  #press .pp-hl-col.wide h3 + .pp-hl-row + .pp-hl-row b,#press .pp-hl-col.wide h3 + .pp-hl-row + .pp-hl-row span{border-top:1px solid rgba(255,255,254,.12)}
  #press .pp-hl-row b{font-size:34px}
  #press .pp-hunt .pp-facts{grid-template-columns:1fr}
  #press .pp-hunt .pp-facts dd{border-top:0;padding-top:0}
  #press .pp-phone{flex-basis:150px}
  #press{padding-top:120px}
  #press .pp-wrap{padding:0 16px}
  #press .pp-section{margin-top:36px;padding:32px 20px 28px}
  #press .pp-kit{grid-template-columns:1fr;gap:32px}
  #press .pp-contacts{grid-template-columns:1fr}
  #press .pp-addr,#press .pp-facts dt,#press .pp-facts dd{white-space:normal;overflow-wrap:anywhere}
  #press .pr-grid{grid-template-columns:1fr}
}
</style>
<div id="press">
  <div class="pp-wrap">
    <p class="pp-kicker">PRESS AND MEDIA KIT</p>
    <h1>The Press Room</h1>
    <p class="pp-lede">All the information you might need for reviews, interviews, and who to talk to about “Cello’s Gate” and the Treasure Hunt Marketing Campaign. For review copies, interviews, and quotes, reach out to the crew listed in the contact section below.</p>

    <section class="pp-section pp-hunt" id="pp-hunt">
      <h2 class="pp-hunt-title"><span class="w">Cello’s Gate</span><span>The Treasure Hunt</span><span class="pp-hunt-sub">An audacious, experiential book marketing campaign unlike anything that’s ever seen done before (probably)</span></h2>
      <p class="pp-hunt-lede">${HUNT_LEDE}</p>
      <p class="pp-motto">${esc(HUNT_MOTTO)}</p>
      <p class="pp-hunt-lede">${HUNT_HOW}</p>
      <div class="pp-ways">${HUNT_WAYS.map(([h, t]) => `<div class="pp-way"><h3>${esc(h)}</h3><p>${esc(t)}</p></div>`).join('')}</div>
      <div class="pp-hl">${HIGHLIGHTS.map(([head, rows, wide]) => `<div class="pp-hl-col${wide ? ' wide' : ''}"><h3>${esc(head)}</h3>${rows.map(([n, t]) => `<div class="pp-hl-row"><b>${esc(n)}</b><span>${esc(t)}</span></div>`).join('')}</div>`).join('')}</div>
      <p class="pp-asof">As of ${esc(STATS_DATE)}.</p>
      <blockquote class="pp-quote">${HUNT_QUOTE.map((p, i, a) => `<p>${i === 0 ? '“' : ''}${esc(p)}${i === a.length - 1 ? '”' : ''}</p>`).join('')}<cite>${esc(HUNT_QUOTE_BY)}</cite></blockquote>
      <dl class="pp-facts">${HUNT_FACTS.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
      <figure class="pp-gfx"><a href="${BASE}assets/press/hunt-overview.png" target="_blank" rel="noopener"><img src="${BASE}assets/press/hunt-overview.webp" width="2400" height="1350" alt="The Cello’s Gate Treasure Hunt: five panels split by brush slashes. Sweepstakes: 3 sweepstakes, 10 winners each. Rewards: 20+ rewards unlocked by collective points for all hunters. Tasks and Riddles: to earn points and unlock secret rewards. Loot Boxes: 101 loot boxes hidden all over the internet. Choose Your Own Adventure: vote on where the crew goes and roll the dice. " loading="lazy"></a><figcaption><a href="${BASE}assets/press/hunt-overview.png" target="_blank" rel="noopener">Download the full-size graphic ↓</a></figcaption></figure>
      <div class="pp-cta"><a class="pp-btn" href="/the-hunt">See the hunt</a><a class="pp-btn" href="/leaderboard">Live leaderboard</a></div>
    </section>

    <section class="pp-section" id="pp-events">
      <h2>Launch Events</h2>
      <div class="pp-events">${EVENTS.map(eventCard).join('')}</div>
    </section>

    <section class="pp-section" id="pp-contacts">
      <h2>Contacts</h2>
      <div class="pp-contacts">${CONTACTS.map(contact).join('')}
      </div>
    </section>

    <section class="pp-section" id="pp-kit">
      <h2>Press Kit</h2>
      <div class="pp-imgs">${KIT_IMAGES.map(([f, alt, label]) => `
        <a class="pp-img" href="${BASE}assets/press/${f}" target="_blank" rel="noopener"><img src="${BASE}assets/press/${f}" alt="${esc(alt)}" loading="lazy"><span>${esc(label)} <b>↓</b></span></a>`).join('')}
      </div>
      <div class="pp-kit">
        <dl class="pp-facts">${FACTS.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
        <div class="pp-desc">${DESCRIPTION}</div>
      </div>
      <h3 class="pp-sub">Praise for Cello’s Gate</h3>
      <div class="pp-praise">${PRAISE.map(([q, name, by, handle]) => `<figure><blockquote>“${esc(q)}”</blockquote><figcaption>—<b>${esc(name)},</b> ${handle ? `<i>${esc(by)}</i>` : `Author of <i>${esc(by)}</i>`}</figcaption></figure>`).join('')}</div>
      <hr class="pp-rule">
      <h3 class="pp-sub">About the author</h3>
      <p class="pp-bio">Maurice Africh is an ex-theater kid with a passion for tasty food, semi-luxurious travel, reality competition television shows, D&amp;D, and fantasy novels. He currently lives in Asheville, North Carolina with his beautiful wife, Rachel, and his cute, albeit cranky chihuahua, Toby.</p>
    </section>

    <section class="pp-section" id="pp-features">
      <h2>Features and Reviews</h2>
      <div class="pr-grid">${FEATURES.map(card).join('')}
      </div>
    </section>
  </div>
</div>
<script>
// Stretch edge to edge, wherever the Squarespace block sits and however wide it is.
(function () {
  function fit() {
    var e = document.getElementById('press'); if (!e) return;
    var sec = e.closest('section:not(.pp-section)');
    if (sec) Array.prototype.forEach.call(sec.querySelectorAll('.content-wrapper, .fluid-engine'), function (x) { x.style.setProperty('padding-top', '0', 'important'); x.style.setProperty('padding-bottom', '0', 'important'); });
    if (sec) { sec.style.setProperty('padding-top', '0', 'important'); sec.style.setProperty('padding-bottom', '0', 'important'); }
    e.style.marginLeft = '0px';
    e.style.marginLeft = -e.getBoundingClientRect().left + 'px';
    e.style.width = document.documentElement.clientWidth + 'px';
  }
  fit(); addEventListener('resize', fit); addEventListener('load', fit); setTimeout(fit, 600);
})();
// Drop the Squarespace section's padding so no colored band shows above the footer.
(function bleed(){var p=document.getElementById('press'),cw=p&&p.closest('.content-wrapper'),sec=p&&p.closest('.page-section');if(cw){cw.style.paddingTop='0';cw.style.paddingBottom='0';}if(sec)sec.style.minHeight='0';var fe=p&&p.closest('.fluid-engine');if(fe)fe.style.display='block';})();
// Each line of the hunt title stays on one line: shrink a line until it fits the section.
(function () {
  function fitTitle() {
    document.querySelectorAll('#press .pp-hunt-title > span:not(.pp-hunt-sub)').forEach(function (s) {
      s.style.fontSize = '';
      var box = s.parentElement.clientWidth, size = parseFloat(getComputedStyle(s).fontSize);
      while (s.scrollWidth > box && size > 14) { size -= 1; s.style.fontSize = size + 'px'; }
    });
  }
  fitTitle(); addEventListener('resize', fitTitle); addEventListener('load', fitTitle); setTimeout(fitTitle, 700);
  document.addEventListener('input', function (e) { if (e.target.closest && e.target.closest('.pp-hunt-title')) fitTitle(); });
})();
// The page loads after the browser has already looked for #pp-hunt etc., so jump there once it's in.
(function () {
  var id = location.hash.slice(1), el = id && /^pp-/.test(id) && document.getElementById(id);
  if (el) setTimeout(function () { el.scrollIntoView({ block: 'start' }); }, 700);
})();
</script>
`;

writeFileSync(join(ROOT, 'pages', 'home-press.html'), home);
writeFileSync(join(ROOT, 'pages', 'press.html'), press);
console.log(`press.html: ${FEATURES.length} features, ${CONTACTS.length} contacts; home-press.html: ${homeList.length} features`);
