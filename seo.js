// Search titles and descriptions for every public page (Maurice, 2026-11-12: "We need seo plans and sub descriptions for
// every page and seo optimization"). DRAFT wording until he approves it.
//
// On each page this sets the browser-tab title, the search description, the share title and description (Open Graph
// and X), and the canonical address. The home page and the order page also carry the book's details for Google (Book
// and Person structured data). The same titles and descriptions go into each page's Squarespace SEO settings at
// go-live, because link previews on Facebook and iMessage read the page before any script runs.
//
// Titles stay under about 60 characters and descriptions under about 155, so search results show them whole.
(function () {
  var SITE = 'https://www.mauriceafrich.com';
  var SERIES = 'The Sky Pirates of Imperia';
  // [title, description]
  var P = {
    '/': ["Maurice Africh, Author of Cello's Gate",
      "Maurice Africh is the author of Cello's Gate, book one of The Sky Pirates of Imperia: a sci-fi fantasy heist about sky pirates hunting mythic treasure."],
    '/order': ["Order Cello's Gate: Hardcover, Ebook, and Audiobook",
      "Order Cello's Gate by Maurice Africh in hardcover, ebook, or audiobook from Amazon, Barnes & Noble, Bookshop.org, Walmart, Waterstones, Audible, and more."],
    '/links': ["Links: Cello's Gate, Editions, Games, and More",
      "Every link in one place: order Cello's Gate in any edition, take the Sky Pirate Quiz, join the newsletter and the Trench, play the arcade, and shop the merch."],
    '/the-hunt': ["The Cello's Gate Treasure Hunt, Start to Finish",
      "The Cello's Gate treasure hunt in one page: four acts, the games, the loot, the winners, and the crew of frens who solved it."],
    '/newsletter': ["Newsletter: Book News, Merch, and Giveaways",
      "Join Maurice Africh's inner circle of frens for first looks at Sky Pirates of Imperia book updates, merch, giveaways, and members-only content."],
    '/oracles-gift/aura-spectrum': ["The Aura Color Spectrum from Cello's Gate",
      "Every aura color in Cello's Gate and the feelings it shows, from Crimson to Violet. Search the Aura Color Spectrum by color, feeling, or mood."],
    '/sky-pirate-quiz-61748': ["Sky Pirate Quiz: Which Cello's Gate Character Are You?",
      "Which member of the crew from Cello's Gate are you most like? Answer 15 questions and find out which sky pirate sums up your personality."],
    '/crew-dossier': ["Crew Dossiers: Meet the Sky Pirates of Cello's Gate",
      "Seven sky pirates, seven files. Flip through the crew dossiers for the main characters of Cello's Gate, book one of The Sky Pirates of Imperia."],
    '/bookshelf': ["Maurice Africh's Bookshelf: Top 10 Fantasy and Sci-Fi Books",
      "The ten books I love most, from Kings of the Wyld to The Fifth Season, plus the latest five-star reads on my shelf."],
    '/contests': ["Sky Pirate Fan Fiction and Fan Art Contests",
      "Write a story or make art set in the world of The Sky Pirates of Imperia. The rules, the prizes, and how to enter the fan fiction and fan art contests."],
    '/arcade': ["The Cello's Gate Arcade: Free Puzzle and Action Games",
      "Free browser games from the world of Cello's Gate: a new daily puzzle in every game at midnight Eastern, plus arcade games to play anytime."],
    '/adventure': ["The Adventure So Far: A Choose-Your-Own Sky Pirate Story",
      "A choose-your-own-adventure set in the world of Cello's Gate, where readers roll the dice and vote on every move. Read every chapter so far."],
    '/press': ["Press Kit: Maurice Africh and Cello's Gate",
      "Press kit for Maurice Africh and Cello's Gate: author bio, photos, cover art, book details, and contact for interviews and reviews."],
    '/privacy-policy': ["Privacy Policy", "How mauriceafrich.com handles your information, cookies, and newsletter sign-ups."]
  };
  // the games: [title, one line from the arcade]
  var GAMES = {
    '/games': ['Skyword', 'One word from all of SFF, six guesses.'],
    '/sort-the-shelf': ['Sort the Shelf', 'Sixteen books, four hidden shelves.'],
    '/book-icons': ['Book Icons', 'A famous book, told in icons.'],
    '/blades-and-brass': ['Blades & Brass', 'Swords and brass, perfectly balanced.'],
    '/matching-auras': ['Matching Auras', 'Four colors, eight feelings. Match the auras.'],
    '/crest-quest': ['Crest Quest', 'One crest for every row, column, and color.'],
    '/sky-mines': ['Sky Mines', 'Clear the field and dodge the sky mines.'],
    '/airship-runner': ['Airship Runner', 'Five lanes, one airship. Dodge everything and survive as long as you can.'],
    '/thread-the-needle': ['Thread the Needle', "One tap, one puff of lift. Don't touch the rocks."],
    '/trench-run': ['Trench Run', 'Fly up the trench, grab the coins, and stay out of the searchlights.'],
    '/sky-gauntlet': ['The Sky Gauntlet', 'Your cannons never stop firing. Shoot down the rival fleet.'],
    '/the-levian-30527': ['The Levian', 'Swim, eat, and grow the longest Levian of the week.'],
    '/master-stacker-32368': ['Master Stacker', 'Crates fall from the open sky. Land each one in the right place.'],
    '/hold-the-wall-13212': ['Hold the Wall!', 'Send out fighters, work the cannon, and hold the wall.'],
    '/goma-goons-43216': ['Goma Goons', 'Pick a goon, grab a mortar, and knock the rival crews off the map.']
  };
  var DAILY = { '/games': 1, '/sort-the-shelf': 1, '/book-icons': 1, '/blades-and-brass': 1, '/matching-auras': 1, '/crest-quest': 1 };
  Object.keys(GAMES).forEach(function (k) {
    var g = GAMES[k];
    P[k] = [g[0] + (DAILY[k] ? ": A Daily Puzzle from Cello's Gate" : ": A Free Game from Cello's Gate"),
      g[1] + (DAILY[k] ? ' A new puzzle every day at midnight Eastern, free in your browser.' : " Free to play in your browser in the Cello's Gate arcade.")];
  });
  // the adventure chapters: [number, name, what happens]
  var CH = {
    '/red-city': [2, 'Shopping in the Red City', 'The frens vote on who to recruit, which kits to buy, and how to take the island.'],
    '/the-crew': [3, 'Meet the Crew', 'Readers roll for the crew and vote on their names, specialties, weapons, and ship.'],
    '/the-crash': [4, 'Crash Landing', 'The Second Wind comes down hard on De’gaté, and the crew walks away from the wreck.'],
    '/the-river': [5, 'Fight the Levian', 'A river with no bridge, and the Levian rises out of it.'],
    '/the-raft': [6, 'Cross the River', 'Readers hunt down 100 raft pieces and roll for the crossing.'],
    '/river-mayhem': [7, 'River Mayhem', 'The raft breaks apart, and the crew is swept down the river.'],
    '/washed-ashore': [8, 'Washed Ashore', 'The crew is out of the river but scattered along the bank.'],
    '/cerunine-attack': [9, 'Cerunine Attack', 'Rune and Sparrow fight five Cerunines, giant mastiffs the size of ponies.'],
    '/the-reunion': [10, 'The Reunion', 'The last Cerunine drops, and the crew finds each other on the riverbank.'],
    '/the-energy-wave': [11, 'The Energy Wave', 'A white wave of energy hits, and all of the crew’s tech starts to overload.'],
    '/finding-scarlett': [12, 'Finding Scarlett', 'A body washes up on the southern shore. It’s Scarlett.'],
    '/light-on-her-feet': [13, 'Light on Her Feet', 'Scarlett has to cross a beach full of quicksand without getting stuck.'],
    '/pull-her-out': [14, 'Pull Her Out', 'Readers find all 100 strands of rope, and the rolls decide the rescue.'],
    '/the-source': [15, 'The Source of the Wave', 'Rune, Sparrow, and Hale find a way into the building behind the wave.'],
    '/the-break-in': [16, 'The Break-In Gone Wrong', 'Rune trips an alarm, and five prism guards come running.'],
    '/search-the-building': [17, 'Search the Building', 'The crew shuts down the EMP and the island’s aerial defenses.'],
    '/the-captains-request': [18, 'The Captain’s Request', 'Rune, Sparrow, and Hale head south to keep searching for Scarlett.'],
    '/saving-scarlett': [19, 'Saving Scarlett', 'The crew fights a bull goma to get Scarlett back.'],
    '/back-to-the-hunt': [20, 'Back to the Hunt', 'The frens pick the crew’s next landmark: the Temple.'],
    '/the-crew-decides': [21, 'The Crew Decides', 'Readers roll for each of the crew and vote on the next plan.']
  };
  Object.keys(CH).forEach(function (k) {
    var c = CH[k];
    P[k] = ['Chapter ' + c[0] + ': ' + c[1] + ' | The Adventure',
      c[2] + " A sky pirate adventure that readers steer with dice and votes."];
  });
  window.MA_SEO = P;

  var path = location.pathname.replace(/\/+$/, '') || '/';
  var e = P[path];
  if (!e) return;
  function meta(attr, key, val) {
    var m = document.head.querySelector('meta[' + attr + '="' + key + '"]');
    if (!m) { m = document.createElement('meta'); m.setAttribute(attr, key); document.head.appendChild(m); }
    m.setAttribute('content', val);
  }
  function apply() {
    if (document.title !== e[0]) document.title = e[0];
    meta('name', 'description', e[1]);
    meta('property', 'og:title', e[0]); meta('property', 'og:description', e[1]); meta('property', 'og:url', SITE + (path === '/' ? '' : path));
    meta('name', 'twitter:title', e[0]); meta('name', 'twitter:description', e[1]);
    var c = document.head.querySelector('link[rel="canonical"]');
    if (!c) { c = document.createElement('link'); c.rel = 'canonical'; document.head.appendChild(c); }
    c.href = SITE + (path === '/' ? '' : path);
  }
  apply();
  // the page builder can write its own title after this runs; put this one back
  if (window.MutationObserver) { var t = document.querySelector('title'); if (t) new MutationObserver(function () { if (document.title !== e[0]) apply(); }).observe(t, { childList: true }); }

  // The book and the author, for Google (only the home and order pages)
  if (path === '/' || path === '/order') {
    var author = { '@type': 'Person', name: 'Maurice Africh', url: SITE,
      sameAs: ['https://www.instagram.com/mauriceafrich', 'https://www.tiktok.com/@mauriceafrich', 'https://www.youtube.com/@africhmaurice',
        'https://www.facebook.com/profile.php?id=61573491875476'] };
    var book = { '@context': 'https://schema.org', '@type': 'Book', name: "Cello's Gate", author: author,
      bookFormat: 'https://schema.org/Hardcover', isbn: '9781668242834', inLanguage: 'en',
      isPartOf: { '@type': 'BookSeries', name: SERIES }, position: 1,
      image: 'https://africhmaurice.github.io/site/assets/img/cellos-gate-book.webp', url: SITE + '/order',
      description: P['/'][1] };
    var data = path === '/' ? [book, Object.assign({ '@context': 'https://schema.org' }, author)] : [book];
    var s = document.createElement('script'); s.type = 'application/ld+json'; s.id = 'ma-ld';
    s.textContent = JSON.stringify(data.length === 1 ? data[0] : data);
    document.head.appendChild(s);
  }
})();
