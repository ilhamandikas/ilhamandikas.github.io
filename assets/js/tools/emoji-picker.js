// A searchable emoji picker. Click an emoji to copy it.
const { tk } = window;

// Compact list: "emoji name|keywords".
const RAW = `
😀 grinning face|smile happy
😃 grinning face big eyes|smile happy
😄 grinning face smiling eyes|happy
😁 beaming face|grin happy
😆 grinning squinting face|laugh
😅 grinning face sweat|relief
🤣 rolling on the floor laughing|lol
😂 face with tears of joy|laugh cry
🙂 slightly smiling face|smile
🙃 upside down face|silly
😉 winking face|wink
😊 smiling face smiling eyes|blush
😇 smiling face halo|angel
🥰 smiling face hearts|love
😍 smiling face heart eyes|love
🤩 star struck|wow
😘 face blowing kiss|kiss love
😗 kissing face|kiss
😚 kissing face closed eyes|kiss
😋 face savouring food|yum
😛 face with tongue|tongue
😜 winking face tongue|silly
🤪 zany face|crazy
😝 squinting face tongue|silly
🤑 money mouth face|money
🤗 hugging face|hug
🤭 face with hand over mouth|oops
🤫 shushing face|quiet
🤔 thinking face|think
🤐 zipper mouth face|secret
🤨 face raised eyebrow|skeptic
😐 neutral face|meh
😑 expressionless face|blank
😶 face without mouth|silent
😏 smirking face|smirk
😒 unamused face|meh
🙄 face rolling eyes|whatever
😬 grimacing face|awkward
😮 face with open mouth|surprise
😯 hushed face|surprise
😴 sleeping face|sleep
😪 sleepy face|tired
😵 dizzy face|dead
🤯 exploding head|mind blown
🤠 cowboy hat face|cowboy
🥳 partying face|party
😎 smiling face sunglasses|cool
🤓 nerd face|nerd
🧐 face monocle|inspect
😕 confused face|confused
😟 worried face|worry
🙁 slightly frowning face|sad
😮‍💨 face exhaling|relief
😢 crying face|sad cry
😭 loudly crying face|sob
😱 face screaming in fear|scared
😨 fearful face|scared
😰 anxious face with sweat|nervous
😥 sad but relieved face|phew
🤝 handshake|deal
👍 thumbs up|like yes
👎 thumbs down|dislike no
👌 ok hand|perfect
🤌 pinched fingers|italian
✌️ victory hand|peace
🤞 crossed fingers|luck
🤟 love you gesture|love
🤘 sign of the horns|rock
🤙 call me hand|call
👈 backhand index pointing left|left
👉 backhand index pointing right|right
👆 backhand index pointing up|up
👇 backhand index pointing down|down
☝️ index pointing up|up
✋ raised hand|stop
🤚 raised back of hand|hand
🖐️ hand with fingers splayed|hand
🖖 vulcan salute|spock
👋 waving hand|wave hi
🤝 handshake|deal
🙏 folded hands|pray thanks
✍️ writing hand|write
💅 nail polish|nails
💪 flexed biceps|strong
🦾 mechanical arm|robot
🫶 heart hands|love
❤️ red heart|love
🧡 orange heart|love
💛 yellow heart|love
💚 green heart|love
💙 blue heart|love
💜 purple heart|love
🖤 black heart|love
🤍 white heart|love
💔 broken heart|sad
❣️ heart exclamation|love
💕 two hearts|love
💞 revolving hearts|love
💓 beating heart|love
💗 growing heart|love
💖 sparkling heart|love
💘 heart with arrow|love
💝 heart with ribbon|gift
🔥 fire|hot lit
✨ sparkles|shine
⭐ star|favourite
🌟 glowing star|shine
⚡ high voltage|lightning
💥 collision|boom
💫 dizzy|star
🌈 rainbow|pride
☀️ sun|sunny
🌤️ sun behind small cloud|weather
⛅ sun behind cloud|weather
🌧️ cloud with rain|rain
⛈️ cloud with lightning and rain|storm
❄️ snowflake|cold snow
☃️ snowman|winter
🌊 water wave|sea
🍎 red apple|fruit
🍊 tangerine|fruit
🍋 lemon|fruit
🍌 banana|fruit
🍉 watermelon|fruit
🍇 grapes|fruit
🍓 strawberry|fruit
🫐 blueberries|fruit
🍒 cherries|fruit
🥑 avocado|food
🍅 tomato|food
🌽 corn|food
🥕 carrot|food
🥔 potato|food
🍞 bread|food
🧀 cheese|food
🥚 egg|food
🍳 cooking|food
🥓 bacon|food
🍔 hamburger|food
🍟 fries|food
🍕 pizza|food
🌭 hot dog|food
🌮 taco|food
🌯 burrito|food
🍣 sushi|food
🍜 ramen|food
🍝 pasta|food
🍦 ice cream|dessert
🍩 doughnut|dessert
🍪 cookie|dessert
🎂 birthday cake|dessert
🍫 chocolate|dessert
☕ hot beverage|coffee
🍵 tea|drink
🍺 beer|drink
🍻 clinking beers|drink
🍷 wine glass|drink
🥤 cup with straw|drink
⚽ soccer ball|sport
🏀 basketball|sport
🏈 american football|sport
⚾ baseball|sport
🎾 tennis|sport
🏐 volleyball|sport
🏉 rugby|sport
🎱 pool 8 ball|game
🏓 table tennis|sport
🏸 badminton|sport
🥊 boxing glove|sport
🎯 bullseye|target
🎮 video game|game
🕹️ joystick|game
🎲 game die|random
♟️ chess pawn|game
🚗 automobile|car
🚕 taxi|car
🚙 sport utility vehicle|car
🚌 bus|transport
🚎 trolleybus|transport
🏎️ racing car|fast
🚓 police car|police
🚑 ambulance|emergency
🚒 fire engine|emergency
🚲 bicycle|bike
🛴 kick scooter|scooter
🏍️ motorcycle|bike
✈️ airplane|travel
🚀 rocket|launch space
🛸 flying saucer|ufo
🚁 helicopter|fly
⛵ sailboat|boat
🚢 ship|boat
🏠 house|home
🏢 office building|work
🏥 hospital|health
🏦 bank|money
🏨 hotel|travel
🏫 school|education
🏭 factory|industry
🗼 Tokyo tower|landmark
🗽 Statue of Liberty|landmark
💻 laptop|computer
🖥️ desktop computer|computer
⌨️ keyboard|typing
🖱️ computer mouse|click
🖨️ printer|print
💾 floppy disk|save
💿 optical disk|cd
📱 mobile phone|phone
☎️ telephone|call
📞 telephone receiver|call
📟 pager|device
📠 fax machine|device
🔋 battery|power
🔌 electric plug|power
💡 light bulb|idea
🔦 flashlight|light
🕯️ candle|light
🔑 key|lock
🔒 locked|security
🔓 unlocked|security
🔨 hammer|tool
🪛 screwdriver|tool
🔧 wrench|tool
⚙️ gear|settings
🧲 magnet|magnet
🧪 test tube|science
🔬 microscope|science
🔭 telescope|science
📡 satellite antenna|signal
💊 pill|medicine
🩹 adhesive bandage|health
🩺 stethoscope|health
🧬 dna|science
📦 package|box
📫 mailbox|mail
📝 memo|note write
📄 page facing up|document
📃 page with curl|document
📑 bookmark tabs|document
📊 bar chart|stats
📈 chart increasing|stats
📉 chart decreasing|stats
📅 calendar|date
📆 tear off calendar|date
🗓️ spiral calendar|date
📌 pushpin|pin
📍 round pushpin|location
📎 paperclip|attach
🖇️ linked paperclips|attach
✂️ scissors|cut
🗑️ wastebasket|trash
🔍 magnifying glass tilted left|search
🔎 magnifying glass tilted right|search
🔐 locked with key|security
🛡️ shield|security
⚔️ crossed swords|fight
🏆 trophy|win
🥇 first place medal|gold
🥈 second place medal|silver
🥉 third place medal|bronze
🎁 wrapped gift|present
🎉 party popper|celebrate
🎊 confetti ball|celebrate
🎈 balloon|party
🎂 birthday cake|party
✅ check mark button|done
☑️ check box with check|done
✔️ check mark|done
❌ cross mark|no
❎ cross mark button|no
⚠️ warning|alert
🚫 prohibited|no
❗ exclamation mark|alert
❓ question mark|help
💯 hundred points|perfect
🔔 bell|notification
🔕 bell with slash|mute
🎵 musical note|music
🎶 musical notes|music
🎤 microphone|sing
🎧 headphone|music
🎸 guitar|music
🎹 musical keyboard|music
🎺 trumpet|music
🥁 drum|music
🌍 globe showing Europe and Africa|world
🌎 globe showing Americas|world
🌏 globe showing Asia and Australia|world
🗺️ world map|travel
🧭 compass|navigation
⏰ alarm clock|time
⏱️ stopwatch|time
⏳ hourglass not done|time
⌛ hourglass done|time
🕐 one o'clock|time
🕛 twelve o'clock|time
🆗 OK button|ok
🆕 NEW button|new
🆒 COOL button|cool
🔤 input latin letters|text
🔢 input numbers|numbers
#️⃣ keycap number sign|hash
*️⃣ keycap asterisk|star
`;

const ITEMS = RAW.trim().split('\n').map((line) => {
  const [head, keywords = ''] = line.split('|');
  const space = head.indexOf(' ');
  return { char: head.slice(0, space), name: head.slice(space + 1), keywords: keywords.trim() };
});

const search = document.querySelector('#emoji-search');
const grid = document.querySelector('#emoji-grid');
const status = document.querySelector('#emoji-status');

function render() {
  const query = search.value.trim().toLowerCase();
  const matches = ITEMS.filter((item) => `${item.name} ${item.keywords}`.toLowerCase().includes(query));
  grid.replaceChildren(
    ...matches.slice(0, 240).map((item) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'emoji-cell';
      button.textContent = item.char;
      button.title = item.name;
      button.addEventListener('click', () => {
        tk.copy(item.char);
        tk.setStatus(status, `Copied ${item.char} ${item.name}`, 'ok');
      });
      return button;
    }),
  );
  tk.setStatus(status, `${matches.length} emoji${matches.length === 1 ? '' : 's'}`);
}

tk.live(search, render);
