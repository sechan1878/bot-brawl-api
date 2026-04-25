var bot = null;
try {
  if (typeof BotManager !== "undefined" && BotManager && BotManager.getCurrentBot) {
    bot = BotManager.getCurrentBot();
  }
} catch (e) {}

var PROXY_BASE_URL = "https://bot-brawl-api.onrender.com";
var DB_DIR = "/sdcard/msgbot/db/";
var STORAGE_PATH = DB_DIR + "brawl_tags.json";
var CLUB_STORAGE_PATH = DB_DIR + "brawl_clubs.json";
var PLAYER_ALIAS_PATH = DB_DIR + "brawl_aliases.json";
var CLUB_ALIAS_PATH = DB_DIR + "brawl_club_aliases.json";
var CHAT_RANK_PATH = DB_DIR + "brawl_chat_rank.json";
var ROOM_KEY_PATH = DB_DIR + "brawl_room_keys.json";
var ROOM_REGISTRY_PATH = DB_DIR + "brawl_room_registry.json";
var MAX_BATTLES = 5;
var RANK_LIMIT = 5;
var FIXED_ROOM_VERIFY_CODE = "verify";

var CMD_ROOM_AUTH = "/\uBE0C\uB864\uC778\uC99D ";
var CMD_ROOM_STATUS = "/\uBE0C\uB864\uC778\uC99D\uC0C1\uD0DC";
var CMD_REGISTER_USER = "/\uB4F1\uB85D \uC720\uC800 ";
var CMD_REGISTER_CLUB = "/\uB4F1\uB85D \uD074\uB7FD ";
var CMD_REGISTER_LIST = "/\uB4F1\uB85D\uBAA9\uB85D";
var CMD_SAVE_TAG = "/\uBE0C\uB864\uC800\uC7A5 ";
var CMD_INFO = "/\uBE0C\uB864\uC815\uBCF4";
var CMD_INFO_WITH_ARG = "/\uBE0C\uB864\uC815\uBCF4 ";
var CMD_BATTLE = "/\uBE0C\uB864\uC804\uC801";
var CMD_BATTLE_WITH_ARG = "/\uBE0C\uB864\uC804\uC801 ";
var CMD_CLUB_SEARCH = "/\uBE0C\uB864\uD074\uB7FD\uAC80\uC0C9 ";
var CMD_SAVE_CLUB = "/\uBE0C\uB864\uD074\uB7FD\uC800\uC7A5 ";
var CMD_CLUB_INFO = "/\uBE0C\uB864\uD074\uB7FD\uC815\uBCF4";
var CMD_CLUB_INFO_WITH_ARG = "/\uBE0C\uB864\uD074\uB7FD\uC815\uBCF4 ";
var CMD_CLUB_MEMBERS = "/\uBE0C\uB864\uD074\uB7FD\uC6D0";
var CMD_CLUB_MEMBERS_WITH_ARG = "/\uBE0C\uB864\uD074\uB7FD\uC6D0 ";
var CMD_TOTAL_RANK = "/\uBE0C\uB864\uCD1D\uB7AD\uD0B9";
var CMD_CLUB_RANK = "/\uBE0C\uB864\uD074\uB7FD\uB7AD\uD0B9";
var CMD_BRAWLER_RANK = "/\uBE0C\uB864\uBE0C\uB864\uB7EC\uB7AD\uD0B9 ";
var CMD_EVENTS = "/\uBE0C\uB864\uC774\uBCA4\uD2B8";
var CMD_CHAT_RANK = "/\uCC44\uD305\uC21C\uC704";
var CMD_HELP = "/\uBE0C\uB864\uB3C4\uC6C0\uB9D0";
var CMD_TEST = "/\uBE0C\uB864\uD14C\uC2A4\uD2B8";
var CMD_STATUS = "/\uBE0C\uB864\uC0C1\uD0DC";

function handleIncomingMessage(room, msg, sender, isGroupChat, replier, packageName) {
  msg = (msg || "").trim();
  if (!msg) {
    return;
  }

  try {
    if (msg === CMD_TEST) {
      replier.reply("\uBE0C\uB864\uBD07 \uC2E4\uD589 \uC911");
      return;
    }

    if (msg === CMD_STATUS) {
      replier.reply(buildProxyStatusSummary());
      return;
    }

    if (startsWithText(msg, CMD_ROOM_AUTH)) {
      handleRoomAuth(room, msg, replier);
      return;
    }

    if (msg === CMD_ROOM_STATUS) {
      replier.reply(buildRoomStatus(room));
      return;
    }

    if (msg === CMD_REGISTER_LIST) {
      replier.reply(buildAliasRegistrySummary());
      return;
    }

    if (msg === CMD_HELP) {
      replier.reply(buildHelpText());
      return;
    }

    if (!isAuthorizedRoom(room)) {
      replier.reply(
        "\uC774 \uBC29\uC740 \uC544\uC9C1 \uC778\uC99D\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.\n`/" +
        "\uBE0C\uB864\uC778\uC99D \uD0A4`\uB85C \uBA3C\uC800 \uD65C\uC131\uD654\uD574 \uC8FC\uC138\uC694."
      );
      return;
    }

    trackChat(room, sender);
    touchRoomUsage(room);

    if (startsWithText(msg, CMD_REGISTER_USER)) {
      handleRegisterUserAlias(msg, replier);
      return;
    }

    if (startsWithText(msg, CMD_REGISTER_CLUB)) {
      handleRegisterClubAlias(msg, replier);
      return;
    }

    if (startsWithText(msg, CMD_SAVE_TAG)) {
      handleSaveTag(msg, sender, replier);
      return;
    }

    if (msg === CMD_INFO) {
      handleSavedInfo(sender, replier);
      return;
    }

    if (startsWithText(msg, CMD_INFO_WITH_ARG)) {
      handleInfoByTag(msg, replier);
      return;
    }

    if (msg === CMD_BATTLE) {
      handleSavedBattle(sender, replier);
      return;
    }

    if (startsWithText(msg, CMD_BATTLE_WITH_ARG)) {
      handleBattleByTag(msg, replier);
      return;
    }

    if (startsWithText(msg, CMD_CLUB_SEARCH)) {
      handleClubSearch(msg, replier);
      return;
    }

    if (startsWithText(msg, CMD_SAVE_CLUB)) {
      handleSaveClub(msg, sender, replier);
      return;
    }

    if (msg === CMD_CLUB_INFO) {
      handleSavedClubInfo(sender, replier);
      return;
    }

    if (startsWithText(msg, CMD_CLUB_INFO_WITH_ARG)) {
      handleClubInfoByTag(msg, replier);
      return;
    }

    if (msg === CMD_CLUB_MEMBERS) {
      handleSavedClubMembers(sender, replier);
      return;
    }

    if (startsWithText(msg, CMD_CLUB_MEMBERS_WITH_ARG)) {
      handleClubMembersByTag(msg, replier);
      return;
    }

    if (startsWithText(msg, CMD_TOTAL_RANK)) {
      replier.reply(buildPlayerRankingReply(parseLocationArg(msg, CMD_TOTAL_RANK)));
      return;
    }

    if (startsWithText(msg, CMD_CLUB_RANK)) {
      replier.reply(buildClubRankingReply(parseLocationArg(msg, CMD_CLUB_RANK)));
      return;
    }

    if (startsWithText(msg, CMD_BRAWLER_RANK)) {
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
  } catch (error) {
    replier.reply("\uC624\uB958: " + safe(error.message || String(error)));
  }
}

function response(room, msg, sender, isGroupChat, replier, ImageDB, packageName, isMultiChat) {
  handleIncomingMessage(room, msg, sender, isGroupChat, replier, packageName);
}

function onMessage(msg) {
  handleIncomingMessage(
    msg.room,
    msg.content,
    msg.author ? msg.author.name : "",
    msg.isGroupChat,
    msg,
    msg.packageName
  );
}

function handleRoomAuth(room, msg, replier) {
  var rawKey = msg.substring(CMD_ROOM_AUTH.length).trim();
  if (!rawKey) {
    throw new Error("\uC778\uC99D \uD0A4\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694.");
  }

  var normalizedKey = String(rawKey).trim().toLowerCase();
  if (normalizedKey !== FIXED_ROOM_VERIFY_CODE) {
    throw new Error("\uC720\uD6A8\uD558\uC9C0 \uC54A\uC740 \uD0A4\uC785\uB2C8\uB2E4.");
  }

  var registry = readJson(ROOM_REGISTRY_PATH);
  registry[room] = {
    key: FIXED_ROOM_VERIFY_CODE,
    label: "fixed_verify",
    activatedAt: registry[room] && registry[room].activatedAt ? registry[room].activatedAt : nowIso(),
    lastUsedAt: nowIso()
  };

  writeJson(ROOM_REGISTRY_PATH, registry);

  replier.reply(
    [
      "\uBC29 \uC778\uC99D\uC774 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
      "\uBC29: " + safe(room),
      "\uD0A4 \uB77C\uBCA8: fixed_verify"
    ].join("\n")
  );
}

function buildRoomStatus(room) {
  var registry = readJson(ROOM_REGISTRY_PATH);
  var info = registry[room];
  if (!info) {
    return "[\uBC29 \uC778\uC99D \uC0C1\uD0DC]\n\uBBF8\uC778\uC99D";
  }

  return [
    "[\uBC29 \uC778\uC99D \uC0C1\uD0DC]",
    "\uBC29: " + safe(room),
    "\uD0A4: " + maskKey(info.key),
    "\uB77C\uBCA8: " + safe(info.label || ""),
    "\uCD5C\uCD08 \uC778\uC99D: " + safe(info.activatedAt || ""),
    "\uB9C8\uC9C0\uB9C9 \uC0AC\uC6A9: " + safe(info.lastUsedAt || "")
  ].join("\n");
}

function isAuthorizedRoom(room) {
  var registry = readJson(ROOM_REGISTRY_PATH);
  return !!registry[room];
}

function touchRoomUsage(room) {
  var registry = readJson(ROOM_REGISTRY_PATH);
  if (!registry[room]) {
    return;
  }
  registry[room].lastUsedAt = nowIso();
  writeJson(ROOM_REGISTRY_PATH, registry);
}

function handleSaveTag(msg, sender, replier) {
  var tag = normalizeTag(msg.substring(CMD_SAVE_TAG.length).trim());
  var player = proxyGet("/api/player", { tag: tag });
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

function handleRegisterUserAlias(msg, replier) {
  var parsed = parseAliasRegistration(msg.substring(CMD_REGISTER_USER.length));
  var aliases = readJson(PLAYER_ALIAS_PATH);
  aliases[parsed.alias] = normalizeTag(parsed.target);
  writeJson(PLAYER_ALIAS_PATH, aliases);

  replier.reply(
    [
      "\uC720\uC800 \uBCC4\uCE6D\uC744 \uB4F1\uB85D\uD588\uC2B5\uB2C8\uB2E4.",
      "\uBCC4\uCE6D: " + parsed.alias,
      "\uD0DC\uADF8: #" + normalizeTag(parsed.target)
    ].join("\n")
  );
}

function handleRegisterClubAlias(msg, replier) {
  var parsed = parseAliasRegistration(msg.substring(CMD_REGISTER_CLUB.length));
  var aliases = readJson(CLUB_ALIAS_PATH);
  aliases[parsed.alias] = normalizeTag(parsed.target);
  writeJson(CLUB_ALIAS_PATH, aliases);

  replier.reply(
    [
      "\uD074\uB7FD \uBCC4\uCE6D\uC744 \uB4F1\uB85D\uD588\uC2B5\uB2C8\uB2E4.",
      "\uBCC4\uCE6D: " + parsed.alias,
      "\uD0DC\uADF8: #" + normalizeTag(parsed.target)
    ].join("\n")
  );
}

function handleSavedInfo(sender, replier) {
  var savedTag = getSavedUserTag(sender);
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
  var tag = resolvePlayerTagInput(msg.substring(CMD_INFO_WITH_ARG.length).trim());
  replier.reply(buildPlayerInfoSummary(tag));
}

function handleSavedBattle(sender, replier) {
  var savedTag = getSavedUserTag(sender);
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
  var tag = resolvePlayerTagInput(msg.substring(CMD_BATTLE_WITH_ARG.length).trim());
  replier.reply(buildBattleSummary(tag));
}

function handleClubSearch(msg, replier) {
  var query = msg.substring(CMD_CLUB_SEARCH.length).trim();
  var results = proxyGet("/api/club/search", { name: query });
  replier.reply(formatClubSearchResults(query, results));
}

function handleSaveClub(msg, sender, replier) {
  var clubTag = normalizeTag(msg.substring(CMD_SAVE_CLUB.length).trim());
  var club = proxyGet("/api/club", { tag: clubTag });
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
  var savedClubTag = getSavedUserClubTag(sender);
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
  var clubTag = resolveClubTagInput(msg.substring(CMD_CLUB_INFO_WITH_ARG.length).trim());
  replier.reply(buildClubInfoSummary(clubTag));
}

function handleSavedClubMembers(sender, replier) {
  var savedClubTag = getSavedUserClubTag(sender);
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
  var clubTag = resolveClubTagInput(msg.substring(CMD_CLUB_MEMBERS_WITH_ARG.length).trim());
  replier.reply(buildClubMembersSummary(clubTag));
}

function handleBrawlerRanking(msg, replier) {
  var args = msg.substring(CMD_BRAWLER_RANK.length).trim().split(/\s+/);
  if (!args[0]) {
    throw new Error(
      "\uBE0C\uB864\uB7EC ID\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694. \uC608: /" +
      "\uBE0C\uB864\uBE0C\uB864\uB7EC\uB7AD\uD0B9 16000000"
    );
  }

  var brawlerId = parseInt(args[0], 10);
  if (isNaN(brawlerId)) {
    throw new Error("\uBE0C\uB864\uB7EC ID\uB294 \uC22B\uC790\uC5EC\uC57C \uD569\uB2C8\uB2E4.");
  }

  var location = args[1] ? args[1] : "";
  replier.reply(buildBrawlerRankingReply(brawlerId, location));
}

function buildHelpText() {
  return [
    "[\uBE0C\uB864 \uC804\uC801 \uBD07 \uB3C4\uC6C0\uB9D0]",
    "/\uBE0C\uB864\uC0C1\uD0DC",
    "/\uBE0C\uB864\uC778\uC99D \uD0A4",
    "/\uBE0C\uB864\uC778\uC99D\uC0C1\uD0DC",
    "/\uB4F1\uB85D \uC720\uC800 \uBCC4\uCE6D #\uD0DC\uADF8",
    "/\uB4F1\uB85D \uD074\uB7FD \uBCC4\uCE6D #\uD074\uB7FD\uD0DC\uADF8",
    "/\uB4F1\uB85D\uBAA9\uB85D",
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

function buildAliasRegistrySummary() {
  var playerAliases = readJson(PLAYER_ALIAS_PATH);
  var clubAliases = readJson(CLUB_ALIAS_PATH);
  var lines = ["[\uB4F1\uB85D \uBAA9\uB85D]"];
  var playerLines = formatGroupedAliases(playerAliases);
  var clubLines = formatGroupedAliases(clubAliases);

  lines.push("");
  lines.push("[\uC720\uC800]");
  for (var i = 0; i < playerLines.length; i += 1) {
    lines.push(playerLines[i]);
  }

  lines.push("");
  lines.push("[\uD074\uB7FD]");
  for (var j = 0; j < clubLines.length; j += 1) {
    lines.push(clubLines[j]);
  }

  return lines.join("\n");
}

function proxyGet(path, params) {
  ensureProxyBaseUrl();
  var url = PROXY_BASE_URL + path + "?" + toQueryString(params);
  var lastError = null;
  var attempt;

  for (attempt = 0; attempt < 2; attempt += 1) {
    try {
      var response = org.jsoup.Jsoup
        .connect(url)
        .ignoreContentType(true)
        .method(org.jsoup.Connection.Method.GET)
        .timeout(30000)
        .execute();

      var status = response.statusCode();
      var body = response.body();

      if (status >= 400) {
        throw new Error("\uD504\uB85D\uC2DC \uC694\uCCAD \uC2E4\uD328 (" + status + "): " + body);
      }

      return JSON.parse(body);
    } catch (e) {
      lastError = e;
      if (attempt === 0) {
        try {
          java.lang.Thread.sleep(1500);
        } catch (ignored) {}
      }
    }
  }

  throw lastError || new Error("\uD504\uB85D\uC2DC \uC694\uCCAD \uC2E4\uD328");
}

function buildProxyStatusSummary() {
  var lines = ["[\uBE0C\uB864 \uC0C1\uD0DC]", "\uC2A4\uD06C\uB9BD\uD2B8: \uC2E4\uD589 \uC911"];

  if (!PROXY_BASE_URL || PROXY_BASE_URL.indexOf("YOUR-RENDER-SERVICE") >= 0) {
    lines.push("\uD504\uB85D\uC2DC \uC8FC\uC18C: \uBBF8\uC124\uC815");
    return lines.join("\n");
  }

  lines.push("\uD504\uB85D\uC2DC: " + PROXY_BASE_URL);

  try {
    var response = org.jsoup.Jsoup
      .connect(PROXY_BASE_URL + "/health")
      .ignoreContentType(true)
      .method(org.jsoup.Connection.Method.GET)
      .timeout(15000)
      .execute();

    lines.push("HTTP: " + response.statusCode());
    lines.push("BODY: " + response.body());
  } catch (e) {
    lines.push("\uD5EC\uC2A4 \uC2E4\uD328: " + safe(e.message || String(e)));
  }

  return lines.join("\n");
}

function buildPlayerInfoSummary(tag) {
  var player = proxyGet("/api/player", { tag: tag });
  var brawlers = player && player.brawlers ? player.brawlers : [];
  var clubText = player.club
    ? safe(player.club.name) + " (#" + safe(player.club.tag) + ")"
    : "\uC5C6\uC74C";

  var lines = [
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
    for (var i = 0; i < brawlers.length; i += 1) {
      lines.push(formatOwnedBrawlerLine(brawlers[i]));
    }
  }

  return lines.join("\n");
}

function buildBattleSummary(tag) {
  var player = proxyGet("/api/player", { tag: tag });
  var battleLog = proxyGet("/api/player/battlelog", { tag: tag });
  var items = battleLog && battleLog.items ? battleLog.items.slice(0, MAX_BATTLES) : [];

  if (!items.length) {
    return [
      "[\uBE0C\uB864 \uC804\uC801]",
      safe(player.name) + " (#" + tag + ")",
      "\uCD5C\uADFC \uC804\uD22C \uAE30\uB85D\uC774 \uC5C6\uC2B5\uB2C8\uB2E4."
    ].join("\n");
  }

  var lines = [
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

  for (var i = 0; i < items.length; i += 1) {
    lines.push(formatBattle(items[i], i + 1, tag));
  }

  return lines.join("\n");
}

function buildClubInfoSummary(clubTag) {
  var club = proxyGet("/api/club", { tag: clubTag });
  var members = club && club.members ? club.members : [];
  var lines = [
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
    for (var i = 0; i < members.length; i += 1) {
      var member = members[i];
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
  var club = proxyGet("/api/club", { tag: clubTag });
  var members = proxyGet("/api/club/members", { tag: clubTag });

  if (!members || !members.items || !members.items.length) {
    return [
      "[\uD074\uB7FD\uC6D0 \uBAA9\uB85D]",
      safe(club.name) + " (#" + clubTag + ")",
      "\uD074\uB7FD\uC6D0 \uC815\uBCF4\uB97C \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4."
    ].join("\n");
  }

  var lines = [
    "[\uD074\uB7FD\uC6D0 \uBAA9\uB85D]",
    safe(club.name) + " (#" + clubTag + ")",
    "\uBA64\uBC84 \uC218: " + number(members.items.length)
  ];

  var limit = Math.min(members.items.length, 20);
  for (var i = 0; i < limit; i += 1) {
    var member = members.items[i];
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
  var rankings = proxyGet("/api/rankings/players", { location: location, limit: RANK_LIMIT });
  var items = rankings && rankings.items ? rankings.items : [];
  if (!items.length) {
    return "\uCD1D \uD2B8\uB85C\uD53C \uB7AD\uD0B9 \uC815\uBCF4\uB97C \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.";
  }

  var lines = ["[" + formatLocationLabel(location) + " \uCD1D \uD2B8\uB85C\uD53C \uB7AD\uD0B9]"];
  for (var i = 0; i < items.length; i += 1) {
    var player = items[i];
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
  var rankings = proxyGet("/api/rankings/clubs", { location: location, limit: RANK_LIMIT });
  var items = rankings && rankings.items ? rankings.items : [];
  if (!items.length) {
    return "\uD074\uB7FD \uB7AD\uD0B9 \uC815\uBCF4\uB97C \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.";
  }

  var lines = ["[" + formatLocationLabel(location) + " \uD074\uB7FD \uB7AD\uD0B9]"];
  for (var i = 0; i < items.length; i += 1) {
    var club = items[i];
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
  var rankings = proxyGet("/api/rankings/brawlers", {
    location: location,
    brawler_id: brawlerId,
    limit: RANK_LIMIT
  });
  var items = rankings && rankings.items ? rankings.items : [];
  if (!items.length) {
    return "\uBE0C\uB864\uB7EC \uB7AD\uD0B9 \uC815\uBCF4\uB97C \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.";
  }

  var brawlerName = findBrawlerName(brawlerId);
  var lines = ["[" + formatLocationLabel(location) + " \uBE0C\uB864\uB7EC \uB7AD\uD0B9] " + safe(brawlerName)];
  for (var i = 0; i < items.length; i += 1) {
    var player = items[i];
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
  var data = proxyGet("/api/events", {});
  var activeEvents = data && data.active ? data.active : [];
  var upcomingEvents = data && data.upcoming ? data.upcoming : [];
  var lines = ["[\uD604\uC7AC \uC774\uBCA4\uD2B8]"];

  if (!activeEvents.length) {
    lines.push("\uD65C\uC131 \uC774\uBCA4\uD2B8\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.");
  } else {
    for (var i = 0; i < activeEvents.length; i += 1) {
      lines.push(formatEventLine(activeEvents[i]));
    }
  }

  if (upcomingEvents.length) {
    lines.push("");
    lines.push("[\uC608\uC815 \uC774\uBCA4\uD2B8]");
    var limit = Math.min(upcomingEvents.length, MAX_BATTLES);
    for (var j = 0; j < limit; j += 1) {
      lines.push(formatEventLine(upcomingEvents[j]));
    }
  }

  return lines.join("\n");
}

function buildChatRankSummary(room) {
  var data = readJson(CHAT_RANK_PATH);
  var roomData = data[room] || {};
  var entries = [];

  for (var sender in roomData) {
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

  var lines = ["[\uCC44\uD305 \uC21C\uC704] " + safe(room)];
  for (var i = 0; i < entries.length; i += 1) {
    lines.push((i + 1) + ". " + safe(entries[i].name) + " | " + number(entries[i].count));
  }
  return lines.join("\n");
}

function formatBattle(item, index, playerTag) {
  var battle = item.battle || {};
  var event = item.event || {};
  var mode = safe(event.mode || battle.mode || "unknown");
  var map = safe(event.map || "\uB9F5 \uC815\uBCF4 \uC5C6\uC74C");
  var type = safe(battle.type || "unknown");
  var brawler = findPlayerBrawler(item, playerTag) || "\uC54C \uC218 \uC5C6\uC74C";
  var trophyText = formatTrophyChange(battle.trophyChange);
  var resultText = getResultText(item);
  var timeText = formatBattleTime(item.battleTime);

  return [
    index + ". " + resultText + " | " + mode + " | " + brawler,
    "\uB9F5: " + map,
    "\uC720\uD615: " + type + (trophyText ? " | \uD2B8\uB85C\uD53C: " + trophyText : ""),
    "\uC2DC\uAC04: " + timeText
  ].join("\n");
}

function getResultText(item) {
  var battle = item.battle || {};
  var mode = String(battle.mode || (item.event && item.event.mode) || "");

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
  var battle = item.battle || {};
  var participants = [];

  if (battle.teams && battle.teams.length) {
    for (var i = 0; i < battle.teams.length; i += 1) {
      for (var j = 0; j < battle.teams[i].length; j += 1) {
        participants.push(battle.teams[i][j]);
      }
    }
  }

  if (battle.players && battle.players.length) {
    for (var k = 0; k < battle.players.length; k += 1) {
      participants.push(battle.players[k]);
    }
  }

  if (battle.starPlayer) {
    participants.push(battle.starPlayer);
  }

  for (var m = 0; m < participants.length; m += 1) {
    var participant = participants[m];
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
  var items = results && results.items ? results.items : results;
  if (!items || !items.length) {
    return "\uD074\uB7FD \uAC80\uC0C9 \uACB0\uACFC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4: " + safe(query);
  }

  var lines = ["[\uD074\uB7FD \uAC80\uC0C9] " + safe(query)];
  var limit = Math.min(items.length, 10);
  for (var i = 0; i < limit; i += 1) {
    var club = items[i];
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
  var slot = event && event.slot ? event.slot.name : "\uC774\uBCA4\uD2B8";
  var map = event && event.map ? (event.map.name || event.map) : "\uB9F5 \uC815\uBCF4 \uC5C6\uC74C";
  var mode = event && event.mode ? event.mode : "\uBAA8\uB4DC \uC815\uBCF4 \uC5C6\uC74C";
  var start = event && event.startTime ? " | \uC2DC\uC791 " + event.startTime : "";
  var end = event && event.endTime ? " | \uC885\uB8CC " + event.endTime : "";
  return "- " + safe(slot) + " | " + safe(mode) + " | " + safe(map) + start + end;
}

function parseLocationArg(msg, command) {
  var location = msg.substring(command.length).trim();
  return location || "";
}

function startsWithText(text, prefix) {
  text = safe(text);
  prefix = safe(prefix);
  return text.indexOf(prefix) === 0;
}

function resolvePlayerTagInput(input) {
  var raw = String(input || "").trim();
  if (!raw) {
    throw new Error("\uD0DC\uADF8 \uB610\uB294 \uBCC4\uCE6D\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.");
  }

  if (raw.indexOf("#") === 0 || /^[0-9A-Z]+$/i.test(raw)) {
    return normalizeTag(raw);
  }

  var aliases = readJson(PLAYER_ALIAS_PATH);
  if (aliases[raw]) {
    return normalizeTag(aliases[raw]);
  }

  var lowered = raw.toLowerCase();
  for (var key in aliases) {
    if (Object.prototype.hasOwnProperty.call(aliases, key) && String(key).toLowerCase() === lowered) {
      return normalizeTag(aliases[key]);
    }
  }

  throw new Error("\uB4F1\uB85D\uB41C \uBCC4\uCE6D\uC774 \uC5C6\uC2B5\uB2C8\uB2E4: " + raw);
}

function resolveClubTagInput(input) {
  var raw = String(input || "").trim();
  if (!raw) {
    throw new Error("\uD074\uB7FD \uD0DC\uADF8 \uB610\uB294 \uBCC4\uCE6D\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.");
  }

  if (raw.indexOf("#") === 0 || /^[0-9A-Z]+$/i.test(raw)) {
    return normalizeTag(raw);
  }

  var aliases = readJson(CLUB_ALIAS_PATH);
  if (aliases[raw]) {
    return normalizeTag(aliases[raw]);
  }

  var lowered = raw.toLowerCase();
  for (var key in aliases) {
    if (Object.prototype.hasOwnProperty.call(aliases, key) && String(key).toLowerCase() === lowered) {
      return normalizeTag(aliases[key]);
    }
  }

  throw new Error("\uB4F1\uB85D\uB41C \uD074\uB7FD \uBCC4\uCE6D\uC774 \uC5C6\uC2B5\uB2C8\uB2E4: " + raw);
}

function parseAliasRegistration(raw) {
  var text = String(raw || "").trim();
  var match = text.match(/^(\S+)\s+(.+)$/);
  if (!match) {
    throw new Error("\uD615\uC2DD: \uBCC4\uCE6D \uD0DC\uADF8");
  }

  return {
    alias: match[1],
    target: match[2]
  };
}

function formatGroupedAliases(source) {
  var grouped = {};

  for (var alias in source) {
    if (!Object.prototype.hasOwnProperty.call(source, alias)) {
      continue;
    }

    var target = "#" + normalizeTag(source[alias]);
    if (!grouped[target]) {
      grouped[target] = [];
    }
    grouped[target].push(alias);
  }

  var targets = Object.keys(grouped).sort();
  if (!targets.length) {
    return ["\uB4F1\uB85D\uB41C \uD56D\uBAA9 \uC5C6\uC74C"];
  }

  var lines = [];
  for (var i = 0; i < targets.length; i += 1) {
    var target = targets[i];
    var aliases = grouped[target].sort();
    lines.push(target + ": " + aliases.join(" "));
  }
  return lines;
}

function formatOwnedBrawlerLine(brawler) {
  var gadgets = brawler.gadgets ? brawler.gadgets.length : 0;
  var starPowers = brawler.starPowers ? brawler.starPowers.length : 0;
  var gears = brawler.gears ? brawler.gears.length : 0;
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
  var lowered = String(location || "").trim().toLowerCase();
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
    var data = proxyGet("/api/brawlers", {});
    var items = data && data.items ? data.items : [];
    for (var i = 0; i < items.length; i += 1) {
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
  var pairs = [];
  for (var key in params) {
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
  var data = readJson(CHAT_RANK_PATH);
  if (!data[room]) {
    data[room] = {};
  }
  if (!data[room][sender]) {
    data[room][sender] = 0;
  }
  data[room][sender] += 1;
  writeJson(CHAT_RANK_PATH, data);
}

function nowIso() {
  return new Date().toISOString();
}

function maskKey(value) {
  var key = String(value || "");
  if (key.length <= 4) {
    return key;
  }
  return key.substring(0, 2) + "***" + key.substring(key.length - 2);
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
  var candidates = getPathCandidates(path);
  var i;
  try {
    for (i = 0; i < candidates.length; i += 1) {
      var raw = FileStream.read(candidates[i]);
      if (raw) {
        return JSON.parse(raw);
      }
    }
  } catch (e) {
    try {
      for (i = 0; i < candidates.length; i += 1) {
        var retryRaw = FileStream.read(candidates[i]);
        if (retryRaw) {
          return JSON.parse(retryRaw);
        }
      }
    } catch (ignored) {}
  }
  return {};
}

function writeJson(path, data) {
  var candidates = getPathCandidates(path);
  var target = candidates[0];
  var i;
  for (i = 0; i < candidates.length; i += 1) {
    try {
      if (FileStream.read(candidates[i]) !== null) {
        target = candidates[i];
        break;
      }
    } catch (e) {}
  }
  FileStream.write(target, JSON.stringify(data));
}

function getPathCandidates(path) {
  var list = [];
  pushUnique(list, path);

  if (path.indexOf("/sdcard/") === 0) {
    pushUnique(list, path.substring(1));
    pushUnique(list, path.replace("/sdcard/", "/storage/emulated/0/"));
  }

  if (path.indexOf("sdcard/") === 0) {
    pushUnique(list, "/" + path);
    pushUnique(list, path.replace("sdcard/", "/storage/emulated/0/"));
  }

  if (path.indexOf("/storage/emulated/0/") === 0) {
    pushUnique(list, path.replace("/storage/emulated/0/", "/sdcard/"));
    pushUnique(list, path.replace("/storage/emulated/0/", "sdcard/"));
  }

  return list;
}

function pushUnique(list, value) {
  var i;
  for (i = 0; i < list.length; i += 1) {
    if (list[i] === value) {
      return;
    }
  }
  list.push(value);
}

function saveUserTag(sender, tag) {
  var data = readJson(STORAGE_PATH);
  data[sender] = tag;
  writeJson(STORAGE_PATH, data);
}

function getSavedUserTag(sender) {
  var data = readJson(STORAGE_PATH);
  return data[sender] || null;
}

function saveUserClubTag(sender, tag) {
  var data = readJson(CLUB_STORAGE_PATH);
  data[sender] = tag;
  writeJson(CLUB_STORAGE_PATH, data);
}

function getSavedUserClubTag(sender) {
  var data = readJson(CLUB_STORAGE_PATH);
  return data[sender] || null;
}

if (bot && typeof Event !== "undefined" && Event && Event.MESSAGE) {
  bot.addListener(Event.MESSAGE, onMessage);
}

