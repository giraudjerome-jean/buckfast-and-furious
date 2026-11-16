"use strict";

// Places that come up in Buckfast news, used to add a local keyword and
// hashtags to Instagram captions. Each entry: name as written in headlines,
// region (or null), country. Longer names are matched first.

const SCOTLAND = "Scotland";
const ENGLAND = "England";
const NI = "Northern Ireland";
const IRELAND = "Ireland";

const PLACES = [
  // Ayrshire
  ["Ayr", "Ayrshire", SCOTLAND], ["Kilmarnock", "Ayrshire", SCOTLAND], ["Irvine", "Ayrshire", SCOTLAND],
  ["Troon", "Ayrshire", SCOTLAND], ["Prestwick", "Ayrshire", SCOTLAND], ["Girvan", "Ayrshire", SCOTLAND],
  ["Saltcoats", "Ayrshire", SCOTLAND], ["Ardrossan", "Ayrshire", SCOTLAND], ["Largs", "Ayrshire", SCOTLAND],
  ["Cumnock", "Ayrshire", SCOTLAND], ["Auchinleck", "Ayrshire", SCOTLAND], ["Stevenston", "Ayrshire", SCOTLAND],
  ["Kilwinning", "Ayrshire", SCOTLAND], ["Ayrshire", null, SCOTLAND],
  // Glasgow & Clyde
  ["Glasgow", null, SCOTLAND], ["Paisley", "Renfrewshire", SCOTLAND], ["Renfrew", "Renfrewshire", SCOTLAND],
  ["Johnstone", "Renfrewshire", SCOTLAND], ["Greenock", "Inverclyde", SCOTLAND], ["Port Glasgow", "Inverclyde", SCOTLAND],
  ["Clydebank", "West Dunbartonshire", SCOTLAND], ["Dumbarton", "West Dunbartonshire", SCOTLAND],
  ["Motherwell", "Lanarkshire", SCOTLAND], ["Wishaw", "Lanarkshire", SCOTLAND], ["Hamilton", "Lanarkshire", SCOTLAND],
  ["Airdrie", "Lanarkshire", SCOTLAND], ["Coatbridge", "Lanarkshire", SCOTLAND], ["Bellshill", "Lanarkshire", SCOTLAND],
  ["East Kilbride", "Lanarkshire", SCOTLAND], ["Cumbernauld", "Lanarkshire", SCOTLAND], ["Larkhall", "Lanarkshire", SCOTLAND],
  ["Lanark", "Lanarkshire", SCOTLAND], ["Rutherglen", "Lanarkshire", SCOTLAND], ["Lanarkshire", null, SCOTLAND],
  ["Renfrewshire", null, SCOTLAND],
  // Edinburgh, Lothians, Fife, Forth
  ["Edinburgh", null, SCOTLAND], ["Leith", "Edinburgh", SCOTLAND], ["Livingston", "West Lothian", SCOTLAND],
  ["Bathgate", "West Lothian", SCOTLAND], ["Musselburgh", "East Lothian", SCOTLAND], ["Dalkeith", "Midlothian", SCOTLAND],
  ["Penicuik", "Midlothian", SCOTLAND], ["Dunfermline", "Fife", SCOTLAND], ["Kirkcaldy", "Fife", SCOTLAND],
  ["Glenrothes", "Fife", SCOTLAND], ["Methil", "Fife", SCOTLAND], ["Leven", "Fife", SCOTLAND], ["St Andrews", "Fife", SCOTLAND],
  ["Cowdenbeath", "Fife", SCOTLAND], ["Fife", null, SCOTLAND], ["Falkirk", null, SCOTLAND], ["Grangemouth", "Falkirk", SCOTLAND],
  ["Stirling", null, SCOTLAND], ["Alloa", "Clackmannanshire", SCOTLAND],
  // Tayside, North East, Highlands
  ["Dundee", null, SCOTLAND], ["Perth", null, SCOTLAND], ["Arbroath", "Angus", SCOTLAND], ["Montrose", "Angus", SCOTLAND],
  ["Forfar", "Angus", SCOTLAND], ["Brechin", "Angus", SCOTLAND], ["Angus", null, SCOTLAND],
  ["Aberdeen", null, SCOTLAND], ["Peterhead", "Aberdeenshire", SCOTLAND], ["Fraserburgh", "Aberdeenshire", SCOTLAND],
  ["Aberdeenshire", null, SCOTLAND], ["Elgin", "Moray", SCOTLAND], ["Moray", null, SCOTLAND], ["Inverness", "Highlands", SCOTLAND],
  ["Fort William", "Highlands", SCOTLAND], ["Oban", "Argyll", SCOTLAND], ["Lerwick", "Shetland", SCOTLAND],
  ["Kirkwall", "Orkney", SCOTLAND], ["Stornoway", "Western Isles", SCOTLAND],
  // South of Scotland
  ["Dumfries", "Dumfries and Galloway", SCOTLAND], ["Stranraer", "Dumfries and Galloway", SCOTLAND],
  ["Galashiels", "Scottish Borders", SCOTLAND], ["Hawick", "Scottish Borders", SCOTLAND],
  // Elsewhere in the UK and Ireland
  ["Newcastle", null, ENGLAND], ["Blackburn", "Lancashire", ENGLAND], ["Liverpool", null, ENGLAND],
  ["Manchester", null, ENGLAND], ["London", null, ENGLAND], ["Carlisle", "Cumbria", ENGLAND], ["Devon", null, ENGLAND],
  ["Belfast", null, NI], ["Derry", null, NI], ["Letterkenny", "Donegal", IRELAND], ["Donegal", null, IRELAND],
  ["Dublin", null, IRELAND]
].sort((a, b) => b[0].length - a[0].length);

const COUNTRY_TAGS = {
  [SCOTLAND]: ["scotland", "scottishnews"],
  [ENGLAND]: ["england", "uknews"],
  [NI]: ["northernireland", "uknews"],
  [IRELAND]: ["ireland", "irishnews"]
};

function hashtag(value) {
  return value.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// First place named in the text (headline first, then summary). Names are
// matched as capitalised whole words: "Ayr" never matches inside "Ayrshire".
function findPlace(...texts) {
  for (const text of texts) {
    const value = String(text || "");
    let best = null;
    for (const [name, region, country] of PLACES) {
      const match = new RegExp(`(^|[^A-Za-z])${escapeRegExp(name)}(?![A-Za-z])`).exec(value);
      if (match && (!best || match.index < best.index)) best = { index: match.index, name, region, country };
    }
    if (best) return { name: best.name, region: best.region, country: best.country };
  }
  return null;
}

function placeTags(place) {
  if (!place) return COUNTRY_TAGS[SCOTLAND];
  const tags = [hashtag(place.name)];
  if (place.region) tags.push(hashtag(place.region));
  tags.push(...COUNTRY_TAGS[place.country]);
  return [...new Set(tags)];
}

module.exports = { findPlace, placeTags };
