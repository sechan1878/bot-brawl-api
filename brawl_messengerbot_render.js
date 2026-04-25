const PROXY_BASE_URL = "https://YOUR-RENDER-SERVICE.onrender.com";
const STORAGE_PATH = "sdcard/msgbot/brawl_tags.json";
const CLUB_STORAGE_PATH = "sdcard/msgbot/brawl_clubs.json";
const PLAYER_ALIAS_PATH = "sdcard/msgbot/brawl_aliases.json";
const CHAT_RANK_PATH = "sdcard/msgbot/brawl_chat_rank.json";
const MAX_BATTLES = 5;
const RANK_LIMIT = 5;

const CMD_SAVE_TAG = "/\uBE0C\uB864\uC800\uC7A5 ";
const CMD_INFO = "/\uBE0C\uB864\uC815\uBCF4";
const CMD_INFO_WITH_ARG = "/\uBE0C\uB864\uC815\uBCF4 ";
const CMD_BATTLE = "/\uBE0C\uB864\uC804\uC801";
const CMD_BATTLE_WITH_ARG = "/\uBE0C\uB864\uC804\uC801 ";
const CMD_CLUB_SEARCH = "/\uBE0C\uB864\uD074\uB7FD\uAC80\uC0C9 ";
const CMD_SAVE_CLUB = "/\uBE0C\uB864\uD074\uB7FD\uC800\uC7A5 ";
const CMD_CLUB_INFO = "/\uBE0C\uB864\uD074\uB7FD\uC815\uBCF4";
const CMD_CLUB_INFO_WITH_ARG = "/\uBE0C\uB864\uD074\uB7FD\uC815\uBCF4 ";
const CMD_CLUB_MEMBERS = "/\uBE0C\uB864\uD074\uB7FD\uC6D0";
const CMD_CLUB_MEMBERS_WITH_ARG = "/\uBE0C\uB864\uD074\uB7FD\uC6D0 ";
const CMD_TOTAL_RANK = "/\uBE0C\uB864\uCD1D\uB7AD\uD0B9";
const CMD_CLUB_RANK = "/\uBE0C\uB864\uD074\uB7FD\uB7AD\uD0B9";
const CMD_BRAWLER_RANK = "/\uBE0C\uB864\uBE0C\uB864\uB7EC\uB7AD\uD0B9 ";
const CMD_EVENTS = "/\uBE0C\uB864\uC774\uBCA4\uD2B8";
const CMD_CHAT_RANK = "/\uCC44\uD305\uC21C\uC704";
const CMD_HELP = "/\uBE0C\uB864\uB3C4\uC6C0\uB9D0";

function response(room, msg, sender, isGroupChat, replier, ImageDB, packageName, isMultiChat) {
  msg = (msg || "").trim();
  if (!msg) {
    return;
  }

  trackChat(room, sender);

  try {
    if (msg.startsWith(CMD_SAVE_TAG)) {
      handleSaveTag(msg, sender, replier);
      return;
    }

    if (msg === CMD_INFO) {
      handleSavedInfo(sender, replier);
      return;
    }

    if (msg.startsWith(CMD_INFO_WITH_ARG)) {
      handleInfoByTag(msg, replier);
      return;
    }

    if (msg === CMD_BATTLE) {
      handleSavedBattle(sender, replier);
      return;
    }

    if (msg.startsWith(CMD_BATTLE_WITH_ARG)) {
      handleBattleByTag(msg, replier);
      return;
    }

    if (msg.startsWith(CMD_CLUB_SEARCH)) {
      handleClubSearch(msg, replier);
      return;
    }

    if (msg.startsWith(CMD_SAVE_CLUB)) {
      handleSaveClub(msg, sender, replier);
      return;
    }

    if (msg === CMD_CLUB_INFO) {
      handleSavedClubInfo(sender, replier);
      return;
    }

    if (msg.startsWith(CMD_CLUB_INFO_WITH_ARG)) {
      handleClubInfoByTag(msg, replier);
      return;
    }

    if (msg === CMD_CLUB_MEMBERS) {
      handleSavedClubMembers(sender, replier);
      return;
    }

    if (msg.startsWith(CMD_CLUB_MEMBERS_WITH_ARG)) {
      handleClubMembersByTag(msg, replier);
      return;
    }

    if (msg.startsWith(CMD_TOTAL_RANK)) {
      replier.reply(buildPlayerRankingReply(parseLocationArg(msg, CMD_TOTAL_RANK)));
      return;
    }

    if (msg.startsWith(CMD_CLUB_RANK)) {
      replier.reply(buildClubRankingReply(parseLocationArg(msg, CMD_CLUB_RANK)));
      return;
    }

    if (msg.startsWith(CMD_BRAWLER_RANK)) {
      handleBrawlerRanking(msg, replier);
      return;
    }

    if (msg === CMD_EVENTS) {
      replier.reply(buildEventSummary());
      return;
    }

    if (msg === CMD_CHAT_RANK) {
      replier.reply(buildChatRankSummary(room));
      return;
    }

    if (msg === CMD_HELP) {
      replier.reply(buildHelpText());
    }
  } catch (error) {
    replier.reply("\uC624\uB958: " + safe(error.message || String(error)));
  }
}

function handleSaveTag(msg, sender, replier) {
  const tag = normalizeTag(msg.substring(CMD_SAVE_TAG.length).trim());
  const player = proxyGet("/api/player", { tag: tag });
  saveUserTag(sender, tag);
  replier.reply(
    [
      "\uBE0C\uB864 \uD0DC\uADF8\uB97C \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.",
      "",
      "\uB2C9\uB124\uC784: " + safe(player.name),
      "\uD0DC\uADF8: #" + tag,
      "\uC774\uC81C `/" + "\uBE0C\uB864\uC815\uBCF4` \uB610\uB294 `/" + "\uBE0C\uB864\uC804\uC801`\uC744 \uC4F0\uBA74 \uB429\uB2C8\uB2E4."
    ].join("\n")
  );
}

function handleSavedInfo(sender, replier) {
  const savedTag = getSavedUserTag(sender);
  if (!savedTag) {
    replier.reply(
      "\uC800\uC7A5\uB41C \uD0DC\uADF8\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.\n`/" +
      "\uBE0C\uB864\uC800\uC7A5 #\uD0DC\uADF8`\uB85C \uBA3C\uC800 \uB4F1\uB85D\uD574 \uC8FC\uC138\uC694."
    );
    return;
  }
  replier.reply(buildPlayerInfoSummary(savedTag));
}

function handleInfoByTag(msg, replier) {
  const tag = resolvePlayerTagInput(msg.substring(CMD_INFO_WITH_ARG.length).trim());
  replier.reply(buildPlayerInfoSummary(tag));
}

function handleSavedBattle(sender, replier) {
  const savedTag = getSavedUserTag(sender);
  if (!savedTag) {
    replier.reply(
      "\uC800\uC7A5\uB41C \uD0DC\uADF8\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.\n`/" +
      "\uBE0C\uB864\uC800\uC7A5 #\uD0DC\uADF8`\uB85C \uBA3C\uC800 \uB4F1\uB85D\uD574 \uC8FC\uC138\uC694."
    );
    return;
  }
  replier.reply(buildBattleSummary(savedTag));
}

function handleBattleByTag(msg, replier) {
  const tag = resolvePlayerTagInput(msg.substring(CMD_BATTLE_WITH_ARG.length).trim());
  replier.reply(buildBattleSummary(tag));
}

function handleClubSearch(msg, replier) {
  const query = msg.substring(CMD_CLUB_SEARCH.length).trim();
  const results = proxyGet("/api/club/search", { name: query });
  replier.reply(formatClubSearchResults(query, results));
}

function handleSaveClub(msg, sender, replier) {
  const clubTag = normalizeTag(msg.substring(CMD_SAVE_CLUB.length).trim());
  const club = proxyGet("/api/club", { tag: clubTag });
  saveUserClubTag(sender, clubTag);
  replier.reply(
    [
      "\uD074\uB7FD \uD0DC\uADF8\uB97C \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.",
      "",
      "\uD074\uB7FD\uBA85: " + safe(club.name),
      "\uD0DC\uADF8: #" + clubTag,
      "\uC774\uC81C `/" + "\uBE0C\uB864\uD074\uB7FD\uC815\uBCF4` \uB610\uB294 `/" + "\uBE0C\uB864\uD074\uB7FD\uC6D0`\uC744 \uC4F0\uBA74 \uB429\uB2C8\uB2E4."
    ].join("\n")
  );
}

function handleSavedClubInfo(sender, replier) {
  const savedClubTag = getSavedUserClubTag(sender);
  if (!savedClubTag) {
    replier.reply(
      "\uC800\uC7A5\uB41C \uD074\uB7FD \uD0DC\uADF8\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.\n`/" +
      "\uBE0C\uB864\uD074\uB7FD\uC800\uC7A5 #\uD074\uB7FD\uD0DC\uADF8`\uB85C \uBA3C\uC800 \uB4F1\uB85D\uD574 \uC8FC\uC138\uC694."
    );
    return;
  }
  replier.reply(buildClubInfoSummary(savedClubTag));
}

function handleClubInfoByTag(msg, replier) {
  const clubTag = normalizeTag(msg.substring(CMD_CLUB_INFO_WITH_ARG.length).trim());
  replier.reply(buildClubInfoSummary(clubTag));
}

function handleSavedClubMembers(sender, replier) {
  const savedClubTag = getSavedUserClubTag(sender);
  if (!savedClubTag) {
    replier.reply(
      "\uC800\uC7A5\uB41C \uD074\uB7FD \uD0DC\uADF8\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.\n`/" +
      "\uBE0C\uB864\uD074\uB7FD\uC800\uC7A5 #\uD074\uB7FD\uD0DC\uADF8`\uB85C \uBA3C\uC800 \uB4F1\uB85D\uD574 \uC8FC\uC138\uC694."
    );
    return;
  }
  replier.reply(buildClubMembersSummary(savedClubTag));
}

function handleClubMembersByTag(msg, replier) {
  const clubTag = normalizeTag(msg.substring(CMD_CLUB_MEMBERS_WITH_ARG.length).trim());
  replier.reply(buildClubMembersSummary(clubTag));
}

function handleBrawlerRanking(msg, replier) {
  const args = msg.substring(CMD_BRAWLER_RANK.length).trim().split(/\s+/);
  if (!args[0]) {
    throw new Error(
      "\uBE0C\uB864\uB7EC ID\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694. \uC608: /" +
      "\uBE0C\uB864\uBE0C\uB864\uB7EC\uB7AD\uD0B9 16000000"
    );
  }

  const brawlerId = parseInt(args[0], 10);
  if (isNaN(brawlerId)) {
    throw new Error("\uBE0C\uB864\uB7EC ID\uB294 \uC22B\uC790\uC5EC\uC57C \uD569\uB2C8\uB2E4.");
  }

  const location = args[1] ? args[1] : "";
  replier.reply(buildBrawlerRankingReply(brawlerId, location));
}

function buildHelpText() {
  return [
    "[\uBE0C\uB864 \uC804\uC801 \uBD07 \uB3C4\uC6C0\uB9D0]",
    "/\uBE0C\uB864\uC800\uC7A5 #\uD0DC\uADF8",
    "/\uBE0C\uB864\uC815\uBCF4",
    "/\uBE0C\uB864\uC815\uBCF4 #\uD0DC\uADF8|\uBCC4\uCE6D",
    "/\uBE0C\uB864\uC804\uC801",
    "/\uBE0C\uB864\uC804\uC801 #\uD0DC\uADF8|\uBCC4\uCE6D",
    "/\uBE0C\uB864\uD074\uB7FD\uAC80\uC0C9 \uD074\uB7FD\uBA85",
    "/\uBE0C\uB864\uD074\uB7FD\uC800\uC7A5 #\uD074\uB7FD\uD0DC\uADF8",
    "/\uBE0C\uB864\uD074\uB7FD\uC815\uBCF4",
    "/\uBE0C\uB864\uD074\uB7FD\uC815\uBCF4 #\uD074\uB7FD\uD0DC\uADF8",
    "/\uBE0C\uB864\uD074\uB7FD\uC6D0",
    "/\uBE0C\uB864\uD074\uB7FD\uC6D0 #\uD074\uB7FD\uD0DC\uADF8",
    "/\uBE0C\uB864\uCD1D\uB7AD\uD0B9 [location]",
    "/\uBE0C\uB864\uD074\uB7FD\uB7AD\uD0B9 [location]",
    "/\uBE0C\uB864\uBE0C\uB864\uB7EC\uB7AD\uD0B9 brawlerId [location]",
    "/\uBE0C\uB864\uC774\uBCA4\uD2B8",
    "/\uCC44\uD305\uC21C\uC704"
  ].join("\n");
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
    throw new Error("\uD504\uB85D\uC2DC \uC694\uCCAD \uC2E4\uD328 (" + status + "): " + body);
  }

  return JSON.parse(body);
}

function buildPlayerInfoSummary(tag) {
  const player = proxyGet("/api/player", { tag: tag });
  const brawlers = player && player.brawlers ? player.brawlers : [];
  const clubText = player.club
    ? safe(player.club.name) + " (#" + safe(player.club.tag) + ")"
    : "\uC5C6\uC74C";

  const lines = [
    "[\uBE0C\uB864 \uC815\uBCF4]",
    safe(player.name) + " (#" + tag + ")",
    "\uD2B8\uB85C\uD53C: " + number(player.trophies) + " | \uCD5C\uACE0: " + number(player.highestTrophies),
    "\uB808\uBCA8: " + number(player.expLevel) + " | XP: " + number(player.expPoints),
    "3vs3: " + number(player["3vs3Victories"]) +
      " | \uC194\uB85C: " + number(player.soloVictories) +
      " | \uB4C0\uC624: " + number(player.duoVictories),
    "\uB85C\uBCF4\uB7FC\uBE14: " + number(player.bestRoboRumbleTime) +
      " | \uBE45\uBE0C\uB864\uB7EC: " + number(player.bestTimeAsBigBrawler),
    "\uD074\uB7FD: " + clubText,
    "\uC544\uC774\uCF58 ID: " + safe(player.icon ? player.icon.id : "") +
      " | \uC774\uB984 \uC0C9: " + safe(player.nameColor || ""),
    "\uBCF4\uC720 \uBE0C\uB864\uB7EC: " + brawlers.length + "\uBA85"
  ];

  if (brawlers.length) {
    lines.push("");
    lines.push("[\uBCF4\uC720 \uBE0C\uB864\uB7EC]");
    for (let i = 0; i < brawlers.length; i += 1) {
      lines.push(formatOwnedBrawlerLine(brawlers[i]));
    }
  }

  return lines.join("\n");
}

function buildBattleSummary(tag) {
  const player = proxyGet("/api/player", { tag: tag });
  const battleLog = proxyGet("/api/player/battlelog", { tag: tag });
  const items = battleLog && battleLog.items ? battleLog.items.slice(0, MAX_BATTLES) : [];

  if (!items.length) {
    return [
      "[\uBE0C\uB864 \uC804\uC801]",
      safe(player.name) + " (#" + tag + ")",
      "\uCD5C\uADFC \uC804\uD22C \uAE30\uB85D\uC774 \uC5C6\uC2B5\uB2C8\uB2E4."
    ].join("\n");
  }

  const lines = [
    "[\uBE0C\uB864 \uC804\uC801]",
    safe(player.name) + " (#" + tag + ")",
    "\uD2B8\uB85C\uD53C: " + number(player.trophies) +
      " | \uCD5C\uACE0: " + number(player.highestTrophies) +
      " | 3vs3: " + number(player["3vs3Victories"]),
    "\uC194\uB85C: " + number(player.soloVictories) +
      " | \uB4C0\uC624: " + number(player.duoVictories),
    "",
    "[\uCD5C\uADFC \uC804\uD22C " + items.length + "\uAC1C]"
  ];

  for (let i = 0; i < items.length; i += 1) {
    lines.push(formatBattle(items[i], i + 1, tag));
  }

  return lines.join("\n");
}

function buildClubInfoSummary(clubTag) {
  const club = proxyGet("/api/club", { tag: clubTag });
  const members = club && club.members ? club.members : [];
  const lines = [
    "[\uD074\uB7FD \uC815\uBCF4]",
    safe(club.name) + " (#" + clubTag + ")",
    "\uD074\uB7FD \uD0C0\uC785: " + safe(club.type),
    "\uCD1D \uD2B8\uB85C\uD53C: " + number(club.trophies),
    "\uD544\uC694 \uD2B8\uB85C\uD53C: " + number(club.requiredTrophies),
    "\uBA64\uBC84 \uC218: " + members.length,
    "\uC124\uBA85: " + safe(club.description || "")
  ];

  if (members.length) {
    lines.push("");
    lines.push("[\uD074\uB7FD\uC6D0 \uBAA9\uB85D]");
    for (let i = 0; i < members.length; i += 1) {
      const member = members[i];
      lines.push(
        (i + 1) + ". " +
        safe(member.name) +
        " (#" + safe(member.tag) + ")" +
        " | " + safe(member.role) +
        " | " + number(member.trophies)
      );
    }
  }

  return lines.join("\n");
}

function buildClubMembersSummary(clubTag) {
  const club = proxyGet("/api/club", { tag: clubTag });
  const members = proxyGet("/api/club/members", { tag: clubTag });

  if (!members || !members.items || !members.items.length) {
    return [
      "[\uD074\uB7FD\uC6D0 \uBAA9\uB85D]",
      safe(club.name) + " (#" + clubTag + ")",
      "\uD074\uB7FD\uC6D0 \uC815\uBCF4\uB97C \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4."
    ].join("\n");
  }

  const lines = [
    "[\uD074\uB7FD\uC6D0 \uBAA9\uB85D]",
    safe(club.name) + " (#" + clubTag + ")",
    "\uBA64\uBC84 \uC218: " + number(members.items.length)
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
    lines.push("... \uCD1D " + members.items.length + "\uBA85");
  }

  return lines.join("\n");
}

function buildPlayerRankingReply(location) {
  if (!location) {
    return [
      buildPlayerRankingSummary("global"),
      "",
      buildPlayerRankingSummary("\uD55C\uAD6D")
    ].join("\n");
  }
  return buildPlayerRankingSummary(location);
}

function buildPlayerRankingSummary(location) {
  const rankings = proxyGet("/api/rankings/players", { location: location, limit: RANK_LIMIT });
  const items = rankings && rankings.items ? rankings.items : [];
  if (!items.length) {
    return "\uCD1D \uD2B8\uB85C\uD53C \uB7AD\uD0B9 \uC815\uBCF4\uB97C \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.";
  }

  const lines = ["[" + formatLocationLabel(location) + " \uCD1D \uD2B8\uB85C\uD53C \uB7AD\uD0B9]"];
  for (let i = 0; i < items.length; i += 1) {
    const player = items[i];
    lines.push(
      safe(player.rank) + ". " +
      safe(player.name) +
      " (#" + safe(player.tag) + ")" +
      " | \uD2B8\uB85C\uD53C " + number(player.trophies)
    );
  }
  return lines.join("\n");
}

function buildClubRankingReply(location) {
  if (!location) {
    return [
      buildClubRankingSummary("global"),
      "",
      buildClubRankingSummary("\uD55C\uAD6D")
    ].join("\n");
  }
  return buildClubRankingSummary(location);
}

function buildClubRankingSummary(location) {
  const rankings = proxyGet("/api/rankings/clubs", { location: location, limit: RANK_LIMIT });
  const items = rankings && rankings.items ? rankings.items : [];
  if (!items.length) {
    return "\uD074\uB7FD \uB7AD\uD0B9 \uC815\uBCF4\uB97C \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.";
  }

  const lines = ["[" + formatLocationLabel(location) + " \uD074\uB7FD \uB7AD\uD0B9]"];
  for (let i = 0; i < items.length; i += 1) {
    const club = items[i];
    lines.push(
      safe(club.rank) + ". " +
      safe(club.name) +
      " (#" + safe(club.tag) + ")" +
      " | \uD2B8\uB85C\uD53C " + number(club.trophies) +
      " | \uBA64\uBC84 " + number(club.members)
    );
  }
  return lines.join("\n");
}

function buildBrawlerRankingReply(brawlerId, location) {
  if (!location) {
    return [
      buildBrawlerRankingSummary(brawlerId, "global"),
      "",
      buildBrawlerRankingSummary(brawlerId, "\uD55C\uAD6D")
    ].join("\n");
  }
  return buildBrawlerRankingSummary(brawlerId, location);
}

function buildBrawlerRankingSummary(brawlerId, location) {
  const rankings = proxyGet("/api/rankings/brawlers", {
    location: location,
    brawler_id: brawlerId,
    limit: RANK_LIMIT
  });
  const items = rankings && rankings.items ? rankings.items : [];
  if (!items.length) {
    return "\uBE0C\uB864\uB7EC \uB7AD\uD0B9 \uC815\uBCF4\uB97C \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.";
  }

  const brawlerName = findBrawlerName(brawlerId);
  const lines = ["[" + formatLocationLabel(location) + " \uBE0C\uB864\uB7EC \uB7AD\uD0B9] " + safe(brawlerName)];
  for (let i = 0; i < items.length; i += 1) {
    const player = items[i];
    lines.push(
      safe(player.rank) + ". " +
      safe(player.name) +
      " (#" + safe(player.tag) + ")" +
      " | \uBE0C\uB864\uB7EC \uD2B8\uB85C\uD53C " + number(player.trophies)
    );
  }
  return lines.join("\n");
}

function buildEventSummary() {
  const data = proxyGet("/api/events", {});
  const activeEvents = data && data.active ? data.active : [];
  const upcomingEvents = data && data.upcoming ? data.upcoming : [];
  const lines = ["[\uD604\uC7AC \uC774\uBCA4\uD2B8]"];

  if (!activeEvents.length) {
    lines.push("\uD65C\uC131 \uC774\uBCA4\uD2B8\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.");
  } else {
    for (let i = 0; i < activeEvents.length; i += 1) {
      lines.push(formatEventLine(activeEvents[i]));
    }
  }

  if (upcomingEvents.length) {
    lines.push("");
    lines.push("[\uC608\uC815 \uC774\uBCA4\uD2B8]");
    const limit = Math.min(upcomingEvents.length, MAX_BATTLES);
    for (let j = 0; j < limit; j += 1) {
      lines.push(formatEventLine(upcomingEvents[j]));
    }
  }

  return lines.join("\n");
}

function buildChatRankSummary(room) {
  const data = readJson(CHAT_RANK_PATH);
  const roomData = data[room] || {};
  const entries = [];

  for (const sender in roomData) {
    if (Object.prototype.hasOwnProperty.call(roomData, sender)) {
      entries.push({ name: sender, count: Number(roomData[sender]) || 0 });
    }
  }

  if (!entries.length) {
    return "[\uCC44\uD305 \uC21C\uC704]\n" + safe(room) + "\n\uAE30\uB85D\uB41C \uCC44\uD305\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.";
  }

  entries.sort(function(a, b) {
    if (b.count !== a.count) {
      return b.count - a.count;
    }
    return String(a.name).localeCompare(String(b.name));
  });

  const lines = ["[\uCC44\uD305 \uC21C\uC704] " + safe(room)];
  for (let i = 0; i < entries.length; i += 1) {
    lines.push((i + 1) + ". " + safe(entries[i].name) + " | " + number(entries[i].count));
  }
  return lines.join("\n");
}

function formatBattle(item, index, playerTag) {
  const battle = item.battle || {};
  const event = item.event || {};
  const mode = safe(event.mode || battle.mode || "unknown");
  const map = safe(event.map || "\uB9F5 \uC815\uBCF4 \uC5C6\uC74C");
  const type = safe(battle.type || "unknown");
  const brawler = findPlayerBrawler(item, playerTag) || "\uC54C \uC218 \uC5C6\uC74C";
  const trophyText = formatTrophyChange(battle.trophyChange);
  const resultText = getResultText(item);
  const timeText = formatBattleTime(item.battleTime);

  return [
    index + ". " + resultText + " | " + mode + " | " + brawler,
    "\uB9F5: " + map,
    "\uC720\uD615: " + type + (trophyText ? " | \uD2B8\uB85C\uD53C: " + trophyText : ""),
    "\uC2DC\uAC04: " + timeText
  ].join("\n");
}

function getResultText(item) {
  const battle = item.battle || {};
  const mode = String(battle.mode || (item.event && item.event.mode) || "");

  if (battle.result) {
    if (battle.result === "victory") return "\uC2B9\uB9AC";
    if (battle.result === "defeat") return "\uD328\uBC30";
    if (battle.result === "draw") return "\uBB34\uC2B9\uBD80";
    return safe(battle.result);
  }

  if (typeof battle.rank === "number") {
    if (mode === "soloShowdown") {
      if (battle.rank <= 4) return "\uC2B9\uB9AC (\uC21C\uC704 " + battle.rank + ")";
      if (battle.rank <= 6) return "\uBB34\uC2B9\uBD80 (\uC21C\uC704 " + battle.rank + ")";
      return "\uD328\uBC30 (\uC21C\uC704 " + battle.rank + ")";
    }

    if (mode === "duoShowdown") {
      if (battle.rank <= 2) return "\uC2B9\uB9AC (\uC21C\uC704 " + battle.rank + ")";
      if (battle.rank === 3) return "\uBB34\uC2B9\uBD80 (\uC21C\uC704 " + battle.rank + ")";
      return "\uD328\uBC30 (\uC21C\uC704 " + battle.rank + ")";
    }

    return "\uC21C\uC704 " + battle.rank;
  }

  return "\uACB0\uACFC \uC815\uBCF4 \uC5C6\uC74C";
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
    return "\uD074\uB7FD \uAC80\uC0C9 \uACB0\uACFC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4: " + safe(query);
  }

  const lines = ["[\uD074\uB7FD \uAC80\uC0C9] " + safe(query)];
  const limit = Math.min(items.length, 10);
  for (let i = 0; i < limit; i += 1) {
    const club = items[i];
    lines.push(
      (i + 1) + ". " +
      safe(club.name) +
      " (#" + safe(club.tag) + ")" +
      " | \uBA64\uBC84 " + number(club.members) +
      " | \uD2B8\uB85C\uD53C " + number(club.trophies)
    );
  }
  return lines.join("\n");
}

function formatEventLine(event) {
  const slot = event && event.slot ? event.slot.name : "\uC774\uBCA4\uD2B8";
  const map = event && event.map ? (event.map.name || event.map) : "\uB9F5 \uC815\uBCF4 \uC5C6\uC74C";
  const mode = event && event.mode ? event.mode : "\uBAA8\uB4DC \uC815\uBCF4 \uC5C6\uC74C";
  const start = event && event.startTime ? " | \uC2DC\uC791 " + event.startTime : "";
  const end = event && event.endTime ? " | \uC885\uB8CC " + event.endTime : "";
  return "- " + safe(slot) + " | " + safe(mode) + " | " + safe(map) + start + end;
}

function parseLocationArg(msg, command) {
  const location = msg.substring(command.length).trim();
  return location || "";
}

function resolvePlayerTagInput(input) {
  const raw = String(input || "").trim();
  if (!raw) {
    throw new Error("\uD0DC\uADF8 \uB610\uB294 \uBCC4\uCE6D\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.");
  }

  if (raw.indexOf("#") === 0 || /^[0-9A-Z]+$/i.test(raw)) {
    return normalizeTag(raw);
  }

  const aliases = readJson(PLAYER_ALIAS_PATH);
  if (aliases[raw]) {
    return normalizeTag(aliases[raw]);
  }

  const lowered = raw.toLowerCase();
  for (const key in aliases) {
    if (Object.prototype.hasOwnProperty.call(aliases, key) && String(key).toLowerCase() === lowered) {
      return normalizeTag(aliases[key]);
    }
  }

  throw new Error("\uB4F1\uB85D\uB41C \uBCC4\uCE6D\uC774 \uC5C6\uC2B5\uB2C8\uB2E4: " + raw);
}

function formatOwnedBrawlerLine(brawler) {
  const gadgets = brawler.gadgets ? brawler.gadgets.length : 0;
  const starPowers = brawler.starPowers ? brawler.starPowers.length : 0;
  const gears = brawler.gears ? brawler.gears.length : 0;
  return (
    "- " + safe(brawler.name) +
    " | \uD30C\uC6CC " + number(brawler.power) +
    " | \uB7AD\uD06C " + number(brawler.rank) +
    " | \uD2B8\uB85C\uD53C " + number(brawler.trophies) +
    " | \uCD5C\uACE0 " + number(brawler.highestTrophies) +
    " | \uAC00\uC82F " + gadgets +
    " | \uC2A4\uD0C0\uD30C\uC6CC " + starPowers +
    " | \uAE30\uC5B4 " + gears
  );
}

function formatLocationLabel(location) {
  const lowered = String(location || "").trim().toLowerCase();
  if (!lowered || lowered === "global" || lowered === "world" || lowered === "\uC138\uACC4") {
    return "\uC138\uACC4";
  }
  if (lowered === "\uD55C\uAD6D" || lowered === "korea" || lowered === "south korea" || lowered === "kr" || lowered === "kor") {
    return "\uD55C\uAD6D";
  }
  return safe(location);
}

function findBrawlerName(brawlerId) {
  try {
    const data = proxyGet("/api/brawlers", {});
    const items = data && data.items ? data.items : [];
    for (let i = 0; i < items.length; i += 1) {
      if (String(items[i].id) === String(brawlerId)) {
        return items[i].name;
      }
    }
  } catch (e) {}
  return String(brawlerId);
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
    return "\uC2DC\uAC04 \uC815\uBCF4 \uC5C6\uC74C";
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
    throw new Error("\uD0DC\uADF8\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694.");
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
    throw new Error("PROXY_BASE_URL \uAC12\uC744 \uBA3C\uC800 Render \uC8FC\uC18C\uB85C \uBC14\uAFE8 \uC8FC\uC138\uC694.");
  }
}

function trackChat(room, sender) {
  const data = readJson(CHAT_RANK_PATH);
  if (!data[room]) {
    data[room] = {};
  }
  if (!data[room][sender]) {
    data[room][sender] = 0;
  }
  data[room][sender] += 1;
  writeJson(CHAT_RANK_PATH, data);
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
