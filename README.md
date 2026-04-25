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
- API keys are loaded from `db/api_keys.json`

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

- `brawl_messengerbot_render.js`
- `db/brawl_tags.json`
- `db/brawl_clubs.json`
- `db/brawl_aliases.json`
- `db/brawl_chat_rank.json`

Copy the JSON files to:

- `sdcard/msgbot/brawl_tags.json`
- `sdcard/msgbot/brawl_clubs.json`
- `sdcard/msgbot/brawl_aliases.json`
- `sdcard/msgbot/brawl_chat_rank.json`

## API key DB

Edit `db/api_keys.json` and enable the keys you want to use.
The proxy rotates to the next enabled key on every upstream API call.

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
