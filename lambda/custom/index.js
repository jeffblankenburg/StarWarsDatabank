const Alexa = require('ask-sdk-core');
const https = require("https");
const Airtable = require("airtable");
//const Dashbot = require("dashbot")(process.env.dashbot_key).alexa;

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    async handle(handlerInput) {
        console.log(Alexa.getRequestType(handlerInput.requestEnvelope));
        const welcome = await getRandomSpeech("Welcome");
        const actionQuery = await getRandomSpeech("ActionQuery");

        var speakOutput = welcome + " " + actionQuery;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(actionQuery)
            .getResponse();
    }
};

const ItemDescriptionHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (    Alexa.getIntentName(handlerInput.requestEnvelope) === 'CharacterIntent'
                ||  Alexa.getIntentName(handlerInput.requestEnvelope) === 'DroidIntent'
                ||  Alexa.getIntentName(handlerInput.requestEnvelope) === 'CreatureIntent'
                ||  Alexa.getIntentName(handlerInput.requestEnvelope) === 'VehicleIntent'
                ||  Alexa.getIntentName(handlerInput.requestEnvelope) === 'WeaponIntent'
                ||  Alexa.getIntentName(handlerInput.requestEnvelope) === 'TechnologyIntent'
                ||  Alexa.getIntentName(handlerInput.requestEnvelope) === 'ThingIntent'
                ||  Alexa.getIntentName(handlerInput.requestEnvelope) === 'LocationIntent'
                ||  Alexa.getIntentName(handlerInput.requestEnvelope) === 'SpeciesIntent'
                ||  Alexa.getIntentName(handlerInput.requestEnvelope) === 'OrganizationIntent');
    },
    async handle(handlerInput) {
        console.log(Alexa.getIntentName(handlerInput.requestEnvelope));
        var speakOutput = await getItemSpeech(handlerInput, Alexa.getIntentName(handlerInput.requestEnvelope).replace("Intent", ""));
        const actionQuery = await getRandomSpeech("ActionQuery");

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(actionQuery)
            .getResponse();
    }
}

const CharacterIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CharacterIntent';
    },
    async handle(handlerInput) {
        console.log(Alexa.getIntentName(handlerInput.requestEnvelope));
        var speakOutput = await getItemSpeech(handlerInput, "Character");
        const actionQuery = await getRandomSpeech("ActionQuery");

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(actionQuery)
            .getResponse();
    }
};

const DroidIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'DroidIntent';
    },
    async handle(handlerInput) {
        console.log(Alexa.getIntentName(handlerInput.requestEnvelope));
        var speakOutput = await getItemSpeech(handlerInput, "Droid");
        const actionQuery = await getRandomSpeech("ActionQuery");

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(actionQuery)
            .getResponse();
    }
};

const CreatureIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CreatureIntent';
    },
    handle(handlerInput) {
        console.log(Alexa.getIntentName(handlerInput.requestEnvelope));
        const speakOutput = "You asked me for a creature.";

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const VehicleIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'VehicleIntent';
    },
    handle(handlerInput) {
        console.log(Alexa.getIntentName(handlerInput.requestEnvelope));
        const speakOutput = "You asked me for a vehicle.";

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const WeaponIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'WeaponIntent';
    },
    handle(handlerInput) {
        console.log(Alexa.getIntentName(handlerInput.requestEnvelope));
        const speakOutput = "You asked me for a weapon.";

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const TechnologyIntentHandler = {
    canHandle(handlerInput) {
        console.log(Alexa.getIntentName(handlerInput.requestEnvelope));
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'TechnologyIntent';
    },
    handle(handlerInput) {
        const speakOutput = "You asked me for a technology.";

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const ThingIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ThingIntent';
    },
    handle(handlerInput) {
        console.log(Alexa.getIntentName(handlerInput.requestEnvelope));
        const speakOutput = "You asked me for a thing.";

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const LocationIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'LocationIntent';
    },
    handle(handlerInput) {
        console.log(Alexa.getIntentName(handlerInput.requestEnvelope));
        const speakOutput = "You asked me for a location.";

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const SpeciesIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SpeciesIntent';
    },
    handle(handlerInput) {
        console.log(Alexa.getIntentName(handlerInput.requestEnvelope));
        const speakOutput = "You asked me for a species.";

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const OrganizationIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'OrganizationIntent';
    },
    handle(handlerInput) {
        console.log(Alexa.getIntentName(handlerInput.requestEnvelope));
        const speakOutput = "You asked me for an organization.";

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const MediaIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'MediaIntent';
    },
    handle(handlerInput) {
        console.log(Alexa.getIntentName(handlerInput.requestEnvelope));
        const speakOutput = "You asked me for a media.";

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        console.log(Alexa.getIntentName(handlerInput.requestEnvelope));
        const speakOutput = "You said help";

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        console.log(Alexa.getIntentName(handlerInput.requestEnvelope));
        const speakOutput = "Goodbye";

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        console.log(Alexa.getIntentName(handlerInput.requestEnvelope));
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = "You hit the " + intentName + ". Goodbye";

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = "Uh, we had a slight weapons malfunction, but uh... everything's perfectly all right now. We're fine. We're all fine here now, thank you.";
        console.log(`~~~~ Error handled: ${JSON.stringify(error.stack)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

async function getRandomSpeech(table) {
    const response = await httpGet(process.env.airtable_base_speech, "&filterByFormula=AND(IsDisabled%3DFALSE())", table);
    const speech = getRandomItem(response.records);
    console.log("RANDOM SPEECH = " + JSON.stringify(speech));
    return speech.fields.VoiceResponse;
}

async function getSpecificDataById(table, id) {
    const response = await httpGet(process.env.airtable_base_data, "&filterByFormula=AND(IsDisabled%3DFALSE(),RecordId%3D%22" + encodeURIComponent(id) + "%22)", table);
    const data = response.records[0];
    console.log("SPECIFIC ITEM = " + JSON.stringify(data));
    return data;
}

async function getItemSpeech(handlerInput, table){
    var spokenWords = getSpokenWords(handlerInput, table.toLowerCase());
    var resolvedWords = getResolvedWords(handlerInput, table.toLowerCase());
    const actionQuery = await getRandomSpeech("ActionQuery");
    var item;
    var speech = "";
    if (resolvedWords != undefined) {
        if (resolvedWords.length > 1) {
            speech = "I found " + resolvedWords.length + " possible matches for " + spokenWords + ". Did you mean " + getResolvedValuesString(resolvedWords) + "?";
        }
        else {
            item = await getSpecificDataById(table, resolvedWords[0].value.id);
            var description = item.fields.VoiceDescription;
            if (description === undefined) description = "I don't have any information about this " + table + " yet.  My data is still being completed.  My apologies. ";
            speech = "You asked me about " + resolvedWords[0].value.name + ". " + description + " " + actionQuery;
        }
    }
    else {
        //WHAT IF THEY HIT THIS INTENT BUT DON'T MATCH ANYTHING?
        speech = "I didn't find a match for " + spokenWords + ", but you can ask about a character, or a species, or a vehicle, for example. " + actionQuery;
    }
    return speech;
}

function getSpokenWords(handlerInput, slot) {
    if (handlerInput.requestEnvelope
        && handlerInput.requestEnvelope.request
        && handlerInput.requestEnvelope.request.intent
        && handlerInput.requestEnvelope.request.intent.slots
        && handlerInput.requestEnvelope.request.intent.slots[slot]
        && handlerInput.requestEnvelope.request.intent.slots[slot].value)
        return handlerInput.requestEnvelope.request.intent.slots[slot].value;
    else return undefined;
}

function getResolvedWords(handlerInput, slot) {
    if (handlerInput.requestEnvelope
        && handlerInput.requestEnvelope.request
        && handlerInput.requestEnvelope.request.intent
        && handlerInput.requestEnvelope.request.intent.slots
        && handlerInput.requestEnvelope.request.intent.slots[slot]
        && handlerInput.requestEnvelope.request.intent.slots[slot].resolutions
        && handlerInput.requestEnvelope.request.intent.slots[slot].resolutions.resolutionsPerAuthority
        && handlerInput.requestEnvelope.request.intent.slots[slot].resolutions.resolutionsPerAuthority[0]
        && handlerInput.requestEnvelope.request.intent.slots[slot].resolutions.resolutionsPerAuthority[0].values
        && handlerInput.requestEnvelope.request.intent.slots[slot].resolutions.resolutionsPerAuthority[0].values[0])
        return handlerInput.requestEnvelope.request.intent.slots[slot].resolutions.resolutionsPerAuthority[0].values
    else return undefined;
}

function getRandomItem(items) {
    var random = getRandom(0, items.length-1);
    return items[random];
}

function getRandom(min, max){
    return Math.floor(Math.random() * (max-min+1)+min);
}

function getResolvedValuesString(values)
{
    var string = "";
    for (var i = 0;i<values.length; i++)
    {
        if (i != 0) string += ", ";
        if (i === (values.length-1)) string += " or ";
        string += values[i].value.name;
    }
    return string;
}

function httpGet(base, filter, table = "Data"){
    //console.log("IN HTTP GET");
    //console.log("BASE = " + base);
    //console.log("FILTER = " + filter);
    
    var options = {
        host: "api.airtable.com",
        port: 443,
        path: "/v0/" + base + "/" + table + "?api_key=" + process.env.airtable_key + filter,
        method: "GET",
    };

    //console.log("FULL PATH = http://" + options.host + options.path);
    
    return new Promise(((resolve, reject) => {
      const request = https.request(options, (response) => {
        response.setEncoding("utf8");
        let returnData = "";

  
        if (response.statusCode < 200 || response.statusCode >= 300) {
          return reject(new Error(`${response.statusCode}: ${response.req.getHeader("host")} ${response.req.path}`));
        }
        
        //console.log("HTTPS REQUEST OPTIONS = " + JSON.stringify(options));
  
        response.on("data", (chunk) => {
          returnData += chunk;
        });
  
        response.on("end", () => {
          resolve(JSON.parse(returnData));
        });
  
        response.on("error", (error) => {
          reject(error);
        });
      });
      request.end();
    }));
}

const RequestLog = {
    async process(handlerInput) {
        console.log("REQUEST ENVELOPE = " + JSON.stringify(handlerInput.requestEnvelope));
    }
  };
  
  const ResponseLog = {
    process(handlerInput) {
      console.log("RESPONSE BUILDER = " + JSON.stringify(handlerInput.responseBuilder.getResponse()));   
    }
  };

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        ItemDescriptionHandler,
        CharacterIntentHandler,
        DroidIntentHandler,
        CreatureIntentHandler,
        VehicleIntentHandler,
        WeaponIntentHandler,
        TechnologyIntentHandler,
        ThingIntentHandler,
        LocationIntentHandler,
        SpeciesIntentHandler,
        OrganizationIntentHandler,
        MediaIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(ErrorHandler)
    .addRequestInterceptors(RequestLog)
    .addResponseInterceptors(ResponseLog)
    .withApiClient(new Alexa.DefaultApiClient())
    .lambda();
