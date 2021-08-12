const FILE_ID = "{ID}";
let spreadsheet = SpreadsheetApp.openById(FILE_ID);
let sheet = spreadsheet.getSheetByName("Main");

const LINE_TOKEN = sheet.getRange("B1").getValue();
const LONGITUDE = sheet.getRange("B2").getValue();
const LATITUDE = sheet.getRange("B3").getValue();
const COORDINATES = `${LONGITUDE},${LATITUDE}`;
const YAHOO_ID = sheet.getRange("B4").getValue();
const WEATHER_API_KEY = sheet.getRange("B7").getValue();
const WEATHER_API_HOST = sheet.getRange("B8").getValue();

const BLOCK_ELEMENTS = ["", "▏", "▎", "▍", "▌", "▋", "▊", "▉"]


function sendToLine(text) {
   UrlFetchApp.fetch("https://notify-api.line.me/api/notify/", {
     "method"  : "post",
     "payload" : {"message" : text},
     "headers" : {"Authorization" : "Bearer " + LINE_TOKEN}
   });
}

function getRainfall() {
  let apiUrl = `https://map.yahooapis.jp/weather/V1/place?coordinates=${COORDINATES}&output=json&appid=${YAHOO_ID}&interval=5`;
  let response = UrlFetchApp.fetch(apiUrl);
  let json = JSON.parse(response.getContentText());
  return json;
}

function getRainChance(hours=24) {
  let apiUrl = `https://weatherbit-v1-mashape.p.rapidapi.com/forecast/hourly?lat=${LATITUDE}&lon=${LATITUDE}&lang=en&hours=${hours}`;
  let header = {
    "x-rapidapi-key": WEATHER_API_KEY,
    "x-rapidapi-host": WEATHER_API_HOST
  };
  let response = UrlFetchApp.fetch(apiUrl, {
    "method": "GET",
    "headers": header
  });
  let json = JSON.parse(response.getContentText());
  let chances = [];
  for (d of json.data) {
    chances.push(d.pop);
  }
  return chances;
}

function toGraph (rainfall) {
  let r = rainfall * 10;
  let t;
  if (r < 7 * 8) {
    t = "█".repeat(Math.floor(r / 8)) + BLOCK_ELEMENTS[Math.floor(r % 8)] + " " + rainfall;
  } else {
    t = "▒▒▒▒▒▒▒▒" + " " + rainfall;
  }
  return t;
}

function main() {
  let json = getRainfall();
  let total = json.Feature[0].Property.WeatherList.Weather.slice(0, 7).reduce(function(sum, element) {return sum + element.Rainfall;}, 0);
  console.log(json.Feature[0].Property.WeatherList.Weather);
  if (sheet.getRange("B5").getValue()) {
    if (total > 0) {
      let date = json.Feature[0].Property.WeatherList.Weather[0].Date;
      date = date.slice(0,4)+"/"+date.slice(4,6)+"/"+date.slice(6,8)+" "+date.slice(8,10)+":"+date.slice(-2);
      let rainfalls = [];
      for (d of json.Feature[0].Property.WeatherList.Weather) {
        rainfalls.push(toGraph(d.Rainfall));
      }
      sheet.getRange("B5").setValue(false);
      if (sheet.getRange("B6").getValue()) {
        sendToLine(` ${date}\n${rainfalls.join("\n")}`);
      } else {
        console.log("Start raining.");
      }
    }
  } else {
    if (total <= 0) {
      let chances = getRainChance(3);
      let chances_sum = chances.reduce(function(sum, element) {return sum + element;}, 0);
      if (chances[0] <= 5 && chances_sum <= 25) {
        console.log(chances);
        sheet.getRange("B5").setValue(true);
        if (sheet.getRange("B6").getValue()) {
          let date = json.Feature[0].Property.WeatherList.Weather[0].Date;
          date = date.slice(0,4)+"/"+date.slice(4,6)+"/"+date.slice(6,8)+" "+date.slice(8,10)+":"+date.slice(-2);
          let formatedChance = [];
          for (chance of chances) {
            formatedChance.push(`${chance} %`);
          }
          sendToLine(` ${date}\n向こう一時間、降水はない模様です\n${formatedChance.join("\n")}`);
        } else {
          console.log("Stop raining.");
        }
      }
    }
  }
  if (!sheet.getRange("B6").getValue()) {
    console.log("Deactivated.");
  }
}
