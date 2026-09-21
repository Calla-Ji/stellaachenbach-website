// The eleven web3 archetypes for La Reina de la Casa's wardrobe flipper.
// `model` stays null until a game-ready GLB exists for that archetype —
// swapped in later as a pure data change, no layout changes needed here
// (same approach as interstellarMoodboard.js's placeholder swatches).
//
// `modelOffsetY` compensates for each garment export's own local origin —
// CLO's OBJ exports place the figure at real-world (meter) scale but not
// necessarily centered the same way as the placeholder mannequin, so this
// is tuned per-asset rather than assumed to be one constant.
export const REINA_ARCHETYPES = [
  {
    id: 'gamer',
    name: 'The Gamer',
    model: null,
    description: {
      number: 1,
      strength: 'Exceptional gaming skills — dominates the virtual world and competes at the highest levels.',
      weakness: 'Neglects other aspects of life due to immersion in the gaming world.',
      attribute: 'Bold accent colors, binding silhouettes.',
      paragraphs: [
        "Introducing the Gamer, a competitive and dedicated archetype in our collection. This character is all about gaming, passionate about mastering the latest games, and staying ahead of the competition. She's dedicated to her craft, spending hours upon hours perfecting her skills and unlocking new achievements.",
        'Her weakness is that she can become so immersed in her gaming world that she neglects other aspects of her life. Her superpower is her exceptional gaming skills, which allow her to dominate the virtual world and compete at the highest levels.',
        "Her primary attribute is her bold choice of colors and, therefore, confident style; it reflects her love for gaming and her competitive spirit. The Gamer isn't afraid to show off her passion for gaming through fashion and accessories. She lives her passion to the fullest.",
      ],
    },
  },
  {
    id: 'object-of-desire',
    name: 'The Object of Desire',
    model: '/worlds/la-reina-de-la-casa/object-of-desire.glb',
    modelOffsetY: -0.544,
    description: {
      number: 2,
      strength: 'Captivating and charming — able to influence and control situations to their advantage.',
      weakness: 'Excessively self-centered, with difficulty empathizing with others.',
      attribute: 'Leather heart, statement chic.',
      paragraphs: [
        "Introducing the Object of Desire, an alluring and mysterious archetype in my collection. This character exudes an air of glamour and sophistication, captivating those around them with their magnetic presence.",
        'They possess a natural charm and charisma that makes them the center of attention, and they know how to use it to their advantage. They are experts in the art of manipulation and can get what they want with ease.',
        'In the fashion world, they are always impeccably dressed and know how to use their style to make a statement. They are always aware of the latest fashion trends, but they make them their own. They are unafraid to take risks and push boundaries with their fashion choices, and they always look effortlessly chic and put together.',
      ],
    },
  },
  {
    id: 'gambler',
    name: 'The Gambler',
    model: null,
    description: {
      number: 3,
      strength: 'Exceptional instincts — a strategic and sharp mind.',
      weakness: 'Gets caught up in the thrill of the game and makes impulsive decisions.',
      attribute: 'Sophisticated silhouettes, French lace.',
      paragraphs: [
        'The Gambler in the web3 space, also known as an NFT flipper, is a skilled risk-taker who is always on the lookout for opportunities to turn a profit. She is bold and confident, unafraid to make bold moves in the high-stakes world of NFT flipping. Despite her bravado, she is highly analytical, constantly studying market trends and patterns to make informed decisions.',
        'Her weakness is her tendency to become overly focused on her investments, neglecting other aspects of her life in the pursuit of profit. This single-minded focus can also lead her to make impulsive decisions, putting her profits at risk.',
        'Her super power is her natural intuition and quick thinking, which allows her to spot market trends before they fully develop. She is also highly adaptable, able to pivot quickly in response to changes in the market.',
        "Her primary attribute is her sleek and sophisticated style, reflecting her love for the thrill of the game. Whether it's through her carefully curated NFT collection or her designer clothing, the female gambler knows how to make a statement.",
      ],
    },
  },
  {
    id: 'huntress',
    name: 'The Huntress',
    model: null,
    description: {
      number: 4,
      strength: 'Sharp senses — a cunning but playful mindset.',
      weakness: 'Tends to become obsessed, neglects her relationships at times.',
      attribute: 'Adventurous details, enforced leather padding.',
      paragraphs: [
        'The Huntress is a master of the game, always on the hunt for free airdrops and reward NFTs. With her sharp senses and cunning mind, she never misses an opportunity to snag some valuable crypto treasures. Her quick reflexes and knowledge of the latest trends and developments in the web3 space make her an unstoppable force in the task journey sphere.',
        'Her weakness, however, is that she can become too obsessed on her hunt, sometimes neglecting her responsibilities and relationships in the real world. But her unwavering determination and passion for discovering new and exciting crypto collectibles make her a formidable collector and asset owner.',
        "With her adventurous spirit and style, the Huntress is an alternative fashion icon in the web3 space. From her sleek, high-tech gear to her grounded yet daring outfits, she's always one step ahead and ready to pounce on the next big opportunity. Whether she's staking for rewards or circling down the rabbit hole of task journeys, the Huntress is a presence that commands respect for her achievements.",
      ],
    },
  },
  {
    id: 'nerd',
    name: 'The Nerd',
    model: null,
    description: {
      number: 5,
      strength: 'Tech-savvy and playful, with a kind yet shy heart.',
      weakness: 'Tends to become obsessed, neglects her relationships at times.',
      attribute: 'Playful figurative accessories, whimsical fabrics.',
      paragraphs: [
        "The Nerd is a tech-savvy and playful persona in the web3 space. With a keen eye for cute NFTs, she adds a touch of whimsical charm to the world of decentralized finance. Her love for all things vintage is evident in her figurative outfit choices, which often feature soft pastel hues and playful accessories.",
        "But don't be fooled by her cute exterior, the Nerd is no pushover. As a true blockchain enthusiast, she actively participates in various DAOs and hackathons, constantly pushing the boundaries of what's possible in the web3 space. Her combination of playful style and technical know-how make her a highly unique being in the sharp world of decentralized finance.",
        'Her mainly cute NFT collection is a combination of both cute NFTs and well-designed figurative pieces, showcasing her eye for both style and function. While the Nerd is a creator in every aspect she is still an enthusiastic collector always on the lookout for new and exciting opportunities to grow her collection.',
        "The Nerd's infectious energy and playful spirit is a breath of fresh air in the web3 world, and her unique approach to contribution is sure to inspire others to embrace their individuality and passions.",
      ],
    },
  },
  {
    id: 'whale',
    name: 'The Whale',
    model: null,
    description: {
      number: 6,
      strength: 'Strategic capital deployment, market foresight, and portfolio resilience.',
      weakness: 'Emotional detachment and transactional relationships — slow to pivot.',
      attribute: 'Sharp tailoring, monochrome elegance, subtle shiny accents.',
      paragraphs: [
        "The Whale doesn't chase trends; she allocates with intention. In the Web3 landscape, she represents sophisticated investors, market makers, and strategic allocators who move capital with precision.",
        'Her strength lies in reading macro shifts, balancing risk, and deploying resources where they compound. Her weakness is a tendency toward emotional distance, treating community dynamics as secondary to portfolio logic.',
        'Her attributes mirror her dual nature: commanding when necessary, refined by intention. The Whale empowers women to take ownership of their assets, proving that capital, when wielded with clarity, is the quietest form of revolution.',
      ],
    },
  },
  {
    id: 'network-guardian',
    name: 'The Network Guardian',
    model: null,
    description: {
      number: 7,
      strength: 'Crisis intuition, protocol safety, and community defense.',
      weakness: 'Overextension and burnout from constant vigilance — can stall innovation with excessive caution.',
      attribute: 'Reinforced tactical layers, modular armor-plating, secure data-weave detailing.',
      paragraphs: [
        'The Network Guardian stands at the frontier of protocol safety and community defense. In the volatile Web3 landscape, she is the first line of defense against exploits, systemic failures, and community crises.',
        'Her strength lies in rapid threat assessment, emergency response, and maintaining network integrity under pressure. Her weakness is a tendency to overextend herself in pursuit of security, sometimes slowing down experimentation with excessive caution.',
        'Her attributes reflect her role: protective yet adaptable, built to withstand crashes while remaining lightweight enough to move. The Guardian empowers women to claim space as protectors and stabilizers, proving that safety and innovation can coexist.',
      ],
    },
  },
  {
    id: 'vr-pioneer',
    name: 'The VR Pioneer',
    model: null,
    description: {
      number: 8,
      strength: 'Spatial reasoning, immersive design, and boundary-pushing tech adoption.',
      weakness: 'Isolation from physical realities and struggles with accessibility — can lose users in complexity.',
      attribute: 'Fluid kinetic draping, motion-reactive fabrics, virtual defense armor and gadgets.',
      paragraphs: [
        "The VR Pioneer pioneers the next dimension of digital fashion and spatial computing. She doesn't just enter the metaverse; she architects the experience.",
        'Her strength lies in spatial intuition, immersive storytelling, and rapid adoption of cutting-edge gadgets, skins, and virtual environments. Her weakness is a tendency to prioritize technological novelty over user accessibility, sometimes alienating newcomers with steep learning curves.',
        "Her attributes mirror her philosophy: fashion that moves, breathes, and responds to the user's presence. The VR Pioneer empowers women to lead the spatial revolution, proving that the future of digital identity is shaped by those who dare to wear it.",
      ],
    },
  },
  {
    id: 'cyber-diva',
    name: 'The Cyber Diva',
    model: null,
    description: {
      number: 9,
      strength: 'Deep understanding of blockchain technology and a sense for entrepreneurship.',
      weakness: 'Impulsive decision maker, tends to overlook important details.',
      attribute: 'Holographic sequins, cyber couture.',
      paragraphs: [
        'Meet the Cyber Diva, a powerful and confident archetype in my collection. As a master of technology, she is a trailblazer in the digital world, pushing the boundaries of what is possible.',
        'With her keen understanding of blockchain and other cutting-edge technologies, she can navigate the complex landscape of the web3 era with ease.',
        'Her passion for innovation and drive to succeed make her a formidable force in the web3 space, where she dominates as a savvy investor and marketer. Her unique perspective and insights inspire others to follow in her footsteps; a force to be reckoned with in the digital world.',
      ],
    },
  },
  {
    id: 'metaverse-heroine',
    name: 'The Metaverse Heroine',
    model: null,
    description: {
      number: 10,
      strength: 'Worldbuilding mastery, cross-platform navigation, and community event leadership.',
      weakness: 'Scattered attention across too many virtual realms — struggles with digital fatigue.',
      attribute: 'Patchwork dimensional seams, gradient teleportation accents, multi-realm modular pieces.',
      paragraphs: [
        'The Metaverse Heroine is a master of digital realms, seamlessly transitioning between virtual worlds, social hubs, and experiential platforms. She literally transcends space.',
        'Her strength lies in cross-platform fluency, event coordination, and community-driven worldbuilding. She thrives on virtual fashion weeks, decentralized concerts, and collaborative digital spaces. Her weakness is digital fatigue, since juggling too many realms and schedules can lead to scattered focus and burnout.',
        'Her attributes symbolize her ability to stitch together disparate virtual ecosystems into cohesive experiences. The Metaverse Heroine empowers women to lead digital gatherings, proving that presence in the metaverse is just as powerful as presence in the real world.',
      ],
    },
  },
  {
    id: 'visionary-goddess',
    name: 'The Visionary Goddess',
    model: null,
    description: {
      number: 11,
      strength: 'Cultural trendsetting, brand alchemy, and aesthetic authority.',
      weakness: 'Perfectionism and a struggle to translate vision into scalable systems — can alienate through exclusivity.',
      attribute: 'Boundless vision headset, flowing textile wings, regal yet avant-garde silhouette, infinite connections.',
      paragraphs: [
        "The Visionary Goddess is the cultural architect of Web3 fashion. She doesn't follow trends; she sets them. Her strength lies in aesthetic authority, brand alchemy, and the ability to translate abstract digital concepts into recognizable cultural movements.",
        "She's the force behind viral digital campaigns, iconic avatar styling, and high-fashion virtual drops. Her weakness is a tendency toward exclusivity and perfectionism, which can sometimes slow down mass adoption or alienate grassroots communities.",
        'Her attributes mirror her influence and sheer endless vision: bold, timeless, and impossible to ignore. The Visionary Goddess empowers women to claim cultural dominance, proving that vision and imagination are the most universal language of the future of technology.',
      ],
    },
  },
]
