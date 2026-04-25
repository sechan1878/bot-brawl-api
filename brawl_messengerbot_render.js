const PROXY_BASE_URL = "https://YOUR-RENDER-SERVICE.onrender.com";
const STORAGE_PATH = "sdcard/msgbot/brawl_tags.json";
const CLUB_STORAGE_PATH = "sdcard/msgbot/brawl_clubs.json";
const MAX_BATTLES = 5;

function response(room, msg, sender, isGroupChat, replier, ImageDB, packageName, isMultiChat) {
  msg = (msg || "").trim();
  if (!msg) {
    return;
  }

  try {
    if (msg.startsWith("/브롤저장 ")) {
      const tag = normalizeTag(msg.substring(6).trim());
      const player = proxyGet("/api/player", { tag: tag });
      saveUserTag(sender, tag);
      replier.reply(
        [
          "브롤 태그를 저장했습니다.",
          "",
          "닉네임: " + safe(player.name),
          "태그: #" + tag,
          "이제 `/브롤전적`만 입력해도 됩니다."
        ].join("\n")
      );
      return;
    }

    if (msg === "/브롤전적") {
      const savedTag = getSavedUserTag(sender);
      if (!savedTag) {
        replier.reply("저장된 태그가 없습니다.\n`/브롤저장 #태그`로 먼저 등록해 주세요.");
        return;
      }
      replier.reply(buildBattleSummary(savedTag));
      return;
    }

    if (msg.startsWith("/브롤전적 ")) {
      const tag = normalizeTag(msg.substring(6).trim());
      replier.reply(buildBattleSummary(tag));
      return;
    }

    if (msg.startsWith("/브롤클럽검색 ")) {
      const query = msg.substring(9).trim();
      const results = proxyGet("/api/club/search", { name: query });
      replier.reply(formatClubSearchResults(query, results));
      return;
    }

    if (msg.startsWith("/브롤클럽저장 ")) {
      const clubTag = normalizeTag(msg.substring(8).trim());
      const club = proxyGet("/api/club", { tag: clubTag });
      saveUserClubTag(sender, clubTag);
      replier.reply(
        [
          "클럽 태그를 저장했습니다.",
          "",
          "클럽명: " + safe(club.name),
          "태그: #" + clubTag,
          "이제 `/브롤클럽원`만 입력해도 됩니다."
        ].join("\n")
      );
      return;
    }

    if (msg === "/브롤클럽원") {
      const savedClubTag = getSavedUserClubTag(sender);
      if (!savedClubTag) {
        replier.reply("저장된 클럽 태그가 없습니다.\n`/브롤클럽저장 #클럽태그`로 먼저 등록해 주세요.");
        return;
      }
      replier.reply(buildClubMembersSummary(savedClubTag));
      return;
    }

    if (msg.startsWith("/브롤클럽원 ")) {
      const clubTag = normalizeTag(msg.substring(7).trim());
      replier.reply(buildClubMembersSummary(clubTag));
      return;
    }

    if (msg === "/브롤도움말") {
      replier.reply(
        [
          "[브롤 전적 봇 도움말]",
          "/브롤저장 #태그",
          "/브롤전적",
          "/브롤전적 #태그",
          "/브롤클럽검색 클럽명",
          "/브롤클럽저장 #클럽태그",
          "/브롤클럽원",
          "/브롤클럽원 #클럽태그"
        ].join("\n")
      );
    }
  } catch (error) {
    replier.reply("오류: " + safe(error.message || String(error)));
  }
}

function proxyGet(path, params) {
  ensureProxyBaseUrl();
  const url = PROXY_BASE_URL + path + "?" + toQueryString(params);
  const response = org.jsoup.Jsoup
    .connect(url)
    .ignoreContentType(true)
    .method(org.jsoup.Connection.Method.GET)
    .timeout(10000)
    .execute();

  const status = response.statusCode();
  const body = response.body();

  if (status >= 400) {
    throw new Error("프록시 요청 실패 (" + status + "): " + body);
  }

  return JSON.parse(body);
}

function buildBattleSummary(tag) {
  const player = proxyGet("/api/player", { tag: tag });
  const battleLog = proxyGet("/api/player/battlelog", { tag: tag });
  const items = battleLog && battleLog.items ? battleLog.items.slice(0, MAX_BATTLES) : [];

  if (items.length === 0) {
    return [
      "[브롤 전적]",
      safe(player.name) + " (#" + tag + ")",
      "최근 전투 기록이 없습니다."
    ].join("\n");
  }

  const lines = [
    "[브롤 전적]",
    safe(player.name) + " (#" + tag + ")",
    "트로피: " + number(player.trophies) +
      " | 최고: " + number(player.highestTrophies) +
      " | 3vs3: " + number(player["3vs3Victories"]),
    "솔로: " + number(player.soloVictories) +
      " | 듀오: " + number(player.duoVictories),
    "",
    "[최근 전투 " + items.length + "개]"
  ];

  for (let i = 0; i < items.length; i += 1) {
    lines.push(formatBattle(items[i], i + 1, tag));
  }

  return lines.join("\n");
}

function buildClubMembersSummary(clubTag) {
  const club = proxyGet("/api/club", { tag: clubTag });
  const members = proxyGet("/api/club/members", { tag: clubTag });

  if (!members || !members.items || !members.items.length) {
    return [
      "[클럽원 목록]",
      safe(club.name) + " (#" + clubTag + ")",
      "클럽원 정보를 찾지 못했습니다."
    ].join("\n");
  }

  const lines = [
    "[클럽원 목록]",
    safe(club.name) + " (#" + clubTag + ")",
    "멤버 수: " + number(members.items.length)
  ];

  const limit = Math.min(members.items.length, 20);
  for (let i = 0; i < limit; i += 1) {
    const member = members.items[i];
    lines.push(
      (i + 1) + ". " +
      safe(member.name) +
      " (#" + safe(member.tag) + ")" +
      " | " + safe(member.role) +
      " | " + number(member.trophies)
    );
  }

  if (members.items.length > limit) {
    lines.push("... 총 " + members.items.length + "명");
  }

  return lines.join("\n");
}

function formatBattle(item, index, playerTag) {
  const battle = item.battle || {};
  const event = item.event || {};
  const mode = safe(event.mode || battle.mode || "unknown");
  const map = safe(event.map || "맵 정보 없음");
  const type = safe(battle.type || "unknown");
  const brawler = findPlayerBrawler(item, playerTag) || "알 수 없음";
  const trophyText = formatTrophyChange(battle.trophyChange);
  const resultText = getResultText(item);
  const timeText = formatBattleTime(item.battleTime);

  return [
    index + ". " + resultText + " | " + mode + " | " + brawler,
    "맵: " + map,
    "유형: " + type + (trophyText ? " | 트로피: " + trophyText : ""),
    "시간: " + timeText
  ].join("\n");
}

function getResultText(item) {
  const battle = item.battle || {};
  const mode = String(battle.mode || (item.event && item.event.mode) || "");

  if (battle.result) {
    if (battle.result === "victory") return "승리";
    if (battle.result === "defeat") return "패배";
    if (battle.result === "draw") return "무승부";
    return safe(battle.result);
  }

  if (typeof battle.rank === "number") {
    if (mode === "soloShowdown") {
      if (battle.rank <= 4) return "승리 (순위 " + battle.rank + ")";
      if (battle.rank <= 6) return "무승부 (순위 " + battle.rank + ")";
      return "패배 (순위 " + battle.rank + ")";
    }

    if (mode === "duoShowdown") {
      if (battle.rank <= 2) return "승리 (순위 " + battle.rank + ")";
      if (battle.rank === 3) return "무승부 (순위 " + battle.rank + ")";
      return "패배 (순위 " + battle.rank + ")";
    }

    return "순위 " + battle.rank;
  }

  return "결과 정보 없음";
}

function findPlayerBrawler(item, playerTag) {
  const battle = item.battle || {};
  const participants = [];

  if (battle.teams && battle.teams.length) {
    for (let i = 0; i < battle.teams.length; i += 1) {
      for (let j = 0; j < battle.teams[i].length; j += 1) {
        participants.push(battle.teams[i][j]);
      }
    }
  }

  if (battle.players && battle.players.length) {
    for (let k = 0; k < battle.players.length; k += 1) {
      participants.push(battle.players[k]);
    }
  }

  if (battle.starPlayer) {
    participants.push(battle.starPlayer);
  }

  for (let m = 0; m < participants.length; m += 1) {
    const participant = participants[m];
    if (
      participant &&
      participant.tag &&
      String(participant.tag).replace("#", "").toUpperCase() === String(playerTag).replace("#", "").toUpperCase() &&
      participant.brawler &&
      participant.brawler.name
    ) {
      return participant.brawler.name;
    }
  }

  return null;
}

function formatClubSearchResults(query, results) {
  const items = results && results.items ? results.items : results;
  if (!items || !items.length) {
    return "클럽 검색 결과가 없습니다: " + safe(query);
  }

  const lines = ["[클럽 검색] " + safe(query)];
  const limit = Math.min(items.length, 10);
  for (let i = 0; i < limit; i += 1) {
    const club = items[i];
    lines.push(
      (i + 1) + ". " +
      safe(club.name) +
      " (#" + safe(club.tag) + ")" +
      " | 멤버 " + number(club.members) +
      " | 트로피 " + number(club.trophies)
    );
  }
  return lines.join("\n");
}

function formatTrophyChange(value) {
  if (typeof value !== "number") {
    return "";
  }
  if (value > 0) {
    return "+" + value;
  }
  return String(value);
}

function formatBattleTime(raw) {
  if (!raw || typeof raw !== "string") {
    return "시간 정보 없음";
  }
  if (raw.length < 15) {
    return raw;
  }
  return raw.substring(0, 4) + "-" +
    raw.substring(4, 6) + "-" +
    raw.substring(6, 8) + " " +
    raw.substring(9, 11) + ":" +
    raw.substring(11, 13);
}

function normalizeTag(tag) {
  tag = String(tag || "").trim().toUpperCase().replace(/^#+/, "");
  tag = tag.replace(/[^0-9A-Z]/g, "");
  if (!tag) {
    throw new Error("태그를 입력해 주세요.");
  }
  return tag;
}

function toQueryString(params) {
  const pairs = [];
  for (const key in params) {
    if (Object.prototype.hasOwnProperty.call(params, key) && params[key] !== undefined && params[key] !== null) {
      pairs.push(encodeURIComponent(key) + "=" + encodeURIComponent(String(params[key])));
    }
  }
  return pairs.join("&");
}

function ensureProxyBaseUrl() {
  if (!PROXY_BASE_URL || PROXY_BASE_URL.indexOf("YOUR-RENDER-SERVICE") >= 0) {
    throw new Error("PROXY_BASE_URL 값을 먼저 Render 주소로 바꿔 주세요.");
  }
}

function number(value) {
  if (typeof value !== "number") {
    return "0";
  }
  return String(value);
}

function safe(value) {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value);
}

function readJson(path) {
  try {
    const raw = FileStream.read(path);
    if (!raw) {
      return {};
    }
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

function writeJson(path, data) {
  FileStream.write(path, JSON.stringify(data));
}

function saveUserTag(sender, tag) {
  const data = readJson(STORAGE_PATH);
  data[sender] = tag;
  writeJson(STORAGE_PATH, data);
}

function getSavedUserTag(sender) {
  const data = readJson(STORAGE_PATH);
  return data[sender] || null;
}

function saveUserClubTag(sender, tag) {
  const data = readJson(CLUB_STORAGE_PATH);
  data[sender] = tag;
  writeJson(CLUB_STORAGE_PATH, data);
}

function getSavedUserClubTag(sender) {
  const data = readJson(CLUB_STORAGE_PATH);
  return data[sender] || null;
}
