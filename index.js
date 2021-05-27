// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require("ask-sdk-core");
const axios = require("axios");
const moment = require("moment");
const external = require("./previousMatch.js");

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "LaunchRequest"
    );
  },
  handle(handlerInput) {
    const speakOutput = "ask for next prayer";
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};
const getLocalTiming = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "getLocalTiming"
    );
  },
  async handle(handlerInput) {
    try {
      const fetch = await axios.get(
        "https://simplescraper.io/api/2DunOAEeTC0eVsWmKZdy?apikey=qX9nGMQbRKalPD4ggdCVswIqFTgoX3M9&limit=100"
      );

      if (fetch.data.data.status == 400) {
        console.log(fetch.data.data.error);
      } else {
        var SalahTimes = [
          fetch.data.data[0].fajr,
          fetch.data.data[0].zuhr,
          fetch.data.data[0].asr,
          fetch.data.data[0].maghreeb,
          fetch.data.data[0].ishaa,
        ];
        console.log(`data fetched from ${fetch.data.name}`);
        if (fetch.data.date_last_ran) {
          var d = fetch.data.date_last_ran;
          const lastRun = new Date(d).toLocaleString("en-GB", {
            day: "numeric",
          });
          var today = new Date().getDate();
          var result = "nothing";
          console.log(`last run ${lastRun} - today ${today}`);
          if (lastRun == today) {
            console.log("we have a match".toUpperCase());
            // console.log(SalahTimes);

            let stop = false;
            if (!stop) {
              result = await nextPrayer(SalahTimes);
              console.log("getting that");
              stop = true;
            }
            console.log(result);
          } else {
            console.log("fetch new data".toUpperCase());
            result = await fetchNewData();
            console.log(result);
          }
        }
        external.findPrevious();
        // return (
        //   handlerInput.responseBuilder
        //     .speak(result)
        //     //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
        //     .getResponse()
        // );
      }
    } catch (error) {
      console.log(error);

      return (
        handlerInput.responseBuilder
          .speak("Something went wrong")
          //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
          .getResponse()
      );
    }
  },
};

const fetchNewData = async () => {
  try {
    await axios.get(
      "https://simplescraper.io/api/2DunOAEeTC0eVsWmKZdy?apikey=qX9nGMQbRKalPD4ggdCVswIqFTgoX3M9&run_now=true&limit=100"
    );

    console.log("data was fetched".toUpperCase());
    return "data is fetched";
  } catch (error) {
    console.log(error);
    return `error- ${error}`;
  }
};

const timeConversion24 = (s) => {
  const ampm = s.slice(-2);
  const hours = Number(s.slice(0, 2));
  let time = s.slice(0, -2);
  if (ampm === "AM") {
    if (hours === 12) {
      // 12am edge-case
      return time.replace(s.slice(0, 2), "00");
    }
    return time;
  } else if (ampm === "PM") {
    if (hours !== 12) {
      return time.replace(s.slice(0, 2), String(hours + 12));
    }
    return time; // 12pm edge-case
  }
  return "Error: AM/PM format is not valid";
};

const nextPrayer = async (arraySalah) => {
  var new24HSalah = [];
  // var currentDate = "23:00:00";

  // var currentDate = moment().add(1, "h").format("HH:mm:ss");
  //local testing only
  var currentDate = moment().format("HH:mm:ss");

  for (x in arraySalah) {
    var salahTime =
      arraySalah[0] == arraySalah[x]
        ? await timeConversion24(`${arraySalah[0]}:00AM`.toString())
        : await timeConversion24(`${arraySalah[x]}:00PM`.toString());

    await new24HSalah.push(salahTime);
  }
  console.log(new24HSalah);

  var next = nextMatch(new24HSalah, currentDate);
  return timeLeft(next, currentDate, new24HSalah);
};

const timeLeft = (next, myTime, arr) => {
  var names = ["Fajr", "Zoher", "Aser", "Magreeb", "Eeshaa"];

  const getName = () => {
    return `${names[arr.indexOf(next)]}`;
  };
  var m1 = next.slice(3, 5);
  var m2 = myTime.slice(3, 5);

  var h1 = next.slice(0, 2);
  var h2 = myTime.slice(0, 2);

  var a = moment().add({ hours: h2, minutes: m2 });
  var b = moment().add({ hours: h1, minutes: m1 });

  console.log(`[${h1}:${m1}masjid] - [${h2}:${m2}mine] - [${next}salah] \n`);

  // console.log(`${a.to(b)}`, moment(`${h1}:${m1}`, ["HH:mm"]).format("hh mm A"));
  return `${getName()} will be ${a.to(b)} at ${moment(`${h1}:${m1}`, [
    "HH:mm",
  ]).format("h mm A")}`;
};

const nextMatch = (arr, myDate) => {
  var i = arr.length;
  while (arr[--i] >= myDate) {}
  var alg = arr[++i] == undefined ? arr[0] : arr[i++];
  return alg;
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.HelpIntent"
    );
  },
  handle(handlerInput) {
    const speakOutput =
      "I can tell next available prayer times from Masjid Noor ask me for next prayer";

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};
const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      (Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "AMAZON.CancelIntent" ||
        Alexa.getIntentName(handlerInput.requestEnvelope) ===
          "AMAZON.StopIntent")
    );
  },
  handle(handlerInput) {
    const speakOutput = "Alright";
    return handlerInput.responseBuilder.speak(speakOutput).getResponse();
  },
};
const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) ===
      "SessionEndedRequest"
    );
  },
  handle(handlerInput) {
    // Any cleanup logic goes here.
    return handlerInput.responseBuilder.getResponse();
  },
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest"
    );
  },
  handle(handlerInput) {
    const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
    const speakOutput = `You just triggered ${intentName} function`;

    return (
      handlerInput.responseBuilder
        .speak(speakOutput)
        //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
        .getResponse()
    );
  },
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`~~~~ Error handled: ${error.stack}`);
    const speakOutput = `Sorry, try again.`;

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    getLocalTiming,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
    IntentReflectorHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();

getLocalTiming.handle();
