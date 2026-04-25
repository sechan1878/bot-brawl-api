# Bot Brawl API

Render Free Web Service에 올려서 메신저봇이 호출하는 브롤스타즈 공식 API 프록시입니다.

## 엔드포인트

- `/health`
- `/api/player?tag=Y2QPGG`
- `/api/player/battlelog?tag=Y2QPGG`
- `/api/club?tag=QCGUUYJ`
- `/api/club/search?name=clubname`
- `/api/club/members?tag=QCGUUYJ`

## Render 설정

- Runtime: `Python`
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn app:app --host 0.0.0.0 --port $PORT`
- Environment Variable: `BRAWL_API_TOKEN`

## 공식 API 기준 호출

- `GET https://api.brawlstars.com/v1/players/%23TAG`
- `GET https://api.brawlstars.com/v1/players/%23TAG/battlelog`
- `GET https://api.brawlstars.com/v1/clubs/%23TAG`
- `GET https://api.brawlstars.com/v1/clubs?name=NAME`
- `GET https://api.brawlstars.com/v1/clubs/%23TAG/members`
