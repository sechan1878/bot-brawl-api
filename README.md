# Bot Brawl API

Thin Render proxy for the official Brawl Stars API.

## Endpoints

- `/health`
- `/api/player?tag=Y2QPGG`
- `/api/player/battlelog?tag=Y2QPGG`
- `/api/club?tag=QCGUUYJ`
- `/api/club/search?name=clubname`
- `/api/club/members?tag=QCGUUYJ`
- `/api/rankings/players?location=global&limit=5`
- `/api/rankings/clubs?location=global&limit=5`
- `/api/rankings/brawlers?location=global&brawler_id=16000000&limit=5`
- `/api/brawlers`
- `/api/events`

## Render

- Runtime: `Python`
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn app:app --host 0.0.0.0 --port $PORT`
- Required env var: `BRAWL_API_TOKEN`

## Upstream official API

- `GET https://api.brawlstars.com/v1/players/%23TAG`
- `GET https://api.brawlstars.com/v1/players/%23TAG/battlelog`
- `GET https://api.brawlstars.com/v1/clubs/%23TAG`
- `GET https://api.brawlstars.com/v1/clubs?name=NAME`
- `GET https://api.brawlstars.com/v1/clubs/%23TAG/members`
- `GET https://api.brawlstars.com/v1/locations/global/rankings/players`
- `GET https://api.brawlstars.com/v1/locations/global/rankings/clubs`
- `GET https://api.brawlstars.com/v1/locations/global/rankings/brawlers/{brawlerId}`
- `GET https://api.brawlstars.com/v1/brawlers`
- `GET https://api.brawlstars.com/v1/events/rotation`

## MessengerBot files

- `브롤봇.js`
- `db/brawl_tags.json`
- `db/brawl_clubs.json`
- `db/brawl_aliases.json`
- `db/brawl_club_aliases.json`
- `db/brawl_chat_rank.json`
- `db/brawl_room_keys.json`
- `db/brawl_room_registry.json`

Put files like this:

- `sdcard/msgbot/브롤봇.js`
- `sdcard/msgbot/db/brawl_tags.json`
- `sdcard/msgbot/db/brawl_clubs.json`
- `sdcard/msgbot/db/brawl_aliases.json`
- `sdcard/msgbot/db/brawl_club_aliases.json`
- `sdcard/msgbot/db/brawl_chat_rank.json`
- `sdcard/msgbot/db/brawl_room_keys.json`
- `sdcard/msgbot/db/brawl_room_registry.json`

## Quick setup

1. Put `브롤봇.js` into `sdcard/msgbot/`
2. Put the whole `db` folder into `sdcard/msgbot/`
3. Edit `브롤봇.js` and set `PROXY_BASE_URL`
4. Edit `db/brawl_room_keys.json` and choose your room key
5. In chat, run `/브롤인증 ROOM-KEY-001`

## Alias registration

- `/등록 유저 별칭 #태그`
- `/등록 클럽 별칭 #클럽태그`
- `/등록목록`

## Room activation keys

Edit `db/brawl_room_keys.json` and register the rooms with:

- `/브롤인증 ROOM-KEY-001`
- `/브롤인증상태`

Only activated rooms can use the bot commands.

## MessengerBot files

- `brawl_messengerbot_render.js`
- `db/brawl_tags.json`
- `db/brawl_clubs.json`
- `db/brawl_aliases.json`

Copy the JSON files to:

- `sdcard/msgbot/brawl_tags.json`
- `sdcard/msgbot/brawl_clubs.json`
- `sdcard/msgbot/brawl_aliases.json`

Alias JSON example:

```json
{
  "my_main": "Y2QPGG",
  "friend_1": "ABC123"
}
```

Then you can use:

- `/브롤정보 my_main`
- `/브롤전적 friend_1`
