const Alexa = require('ask-sdk-core');
const https = require("https");
const Airtable = require("airtable");
var voice = "";
var rate = "medium"
//const Dashbot = require("dashbot")(process.env.dashbot_key).alexa;

const types = ["Character", "Droid", "Creature", "Vehicle", "Weapon", "Technology", "Thing", "Location", "Species", "Organization"];

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
            .speak(changeVoice(speakOutput))
            .reprompt(changeVoice(actionQuery))
            .getResponse();
    }
};

//TODO: CHECK TO SEE IF THEY ANSWERED A QUIZ, AND IF THEY GOT IT CORRECT.
//USE SOUND EFFECTS LIKE EXCITED R2-D2 or DISAPPONTED DARTH VADER.
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
        var sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        var table = Alexa.getIntentName(handlerInput.requestEnvelope).replace("Intent", "").toLowerCase();
        var spokenWords = getSpokenWords(handlerInput, table);
        var resolvedWords = getResolvedWords(handlerInput, table);
        var speech = "";

        //TODO: THIS IS WHERE WE CHECK TO SEE IF THIS WAS A QUIZ, AND CONGRATULATE THE USER FOR GETTING IT CORRECT OR INCORRECT.
        //“Would you like another question, or know more about the last question”

        if (sessionAttributes.quizItem != undefined) {
            //TODO: CHECK THE ENTIRE SET OF VALUES IN RESOLVEDWORDS
            if (sessionAttributes.quizItem.id === resolvedWords[0].value.id) {
                const correct = await getRandomSpeech("CorrectAnswer");
                speech = "<audio src='https://starwarsdatabank.s3.amazonaws.com/sounds/R2D2VeryExcited.mp3'/> " + correct + " ";
            }
            else {
                const wrong = await getRandomSpeech("WrongAnswer");
                speech = "<audio src='https://starwarsdatabank.s3.amazonaws.com/sounds/R2D2Concerned.mp3'/> " + wrong + " ";
            }
        }


        const actionQuery = await getRandomSpeech("ActionQuery");
        var rb = handlerInput.responseBuilder;
        if (resolvedWords != undefined) {
            //if (resolvedWords.length > 1) {
            //    speech += "I found " + resolvedWords.length + " possible matches for " + spokenWords + ". Did you mean " + getResolvedValuesString(resolvedWords) + "?";
            //}
            //else {
                item = await getSpecificDataById(table, resolvedWords[0].value.id);
                var description = item.fields.VoiceDescription;
                if (description === undefined) description = "Oh dear. I know " + resolvedWords[0].value.name + " is a " + table + ", but I don't seem to have any information yet.  My data is still being completed.  My apologies. ";
                speech += "You asked me about " + resolvedWords[0].value.name + ". " + description + " " + actionQuery;
                if (item.fields.Image != undefined) {
                    var imageURL = item.fields.Image[0].url;
                    if (supportsAPL(handlerInput)) {
                        var apl = require("apl/primary_image.json");
                        apl.document.mainTemplate.items[0].items[1].headerTitle = item.fields.Name;
                        apl.document.mainTemplate.items[0].items[2].items[0].source = imageURL;
                        rb.addDirective({
                            type: 'Alexa.Presentation.APL.RenderDocument',
                            token: '[SkillProvidedToken]',
                            version: '1.0',
                            document: apl.document,
                            datasources: apl.datasources
                        })
                    }
                    else {
                        rb.withStandardCard(item.fields.Name, item.fields.CardDescription, imageURL, imageURL);
                    }
                }
            //}
        }
        else {
            //TODO: LOG THIS ENTRY TO REVIEW SPOKEN WORDS THAT DON'T SEEM TO MATCH ANYTHING.
            speech += "I didn't find a match for " + spokenWords + ", but you can ask about a character, or a species, or a vehicle, for example. " + actionQuery;
        }
    
        return rb
            .speak(changeVoice(speech))
            .reprompt(changeVoice(actionQuery))
            .getResponse();
    }
}

const ActorIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ActorIntent';
    },
    async handle(handlerInput) {
        console.log(Alexa.getIntentName(handlerInput.requestEnvelope));
        var spokenWords = getSpokenWords(handlerInput, "character");
        var resolvedWords = getResolvedWords(handlerInput, "character");
        const actionQuery = await getRandomSpeech("ActionQuery");
        var speakOutput = "";
        if (resolvedWords != undefined) {
            item = await getSpecificDataById("Character", resolvedWords[0].value.id);
            console.log("ITEM = " + JSON.stringify(item));
            
            if (item.fields.Actor != undefined) {
                speakOutput = resolvedWords[0].value.name + " is played by " + item.fields.Actor + ". " + actionQuery;
            }
            else speakOutput = "I don't seem to know the actor for " + spokenWords + ".  I've asked my data manager to investigate. " + actionQuery;
        }
        else {
            var airtable = await new Airtable({apiKey: process.env.airtable_key}).base(process.env.airtable_base_error);
            await airtable("Character").create({"SpokenWords": spokenWords}, function(err, record) {if (err) {console.error(err);}});
            speakOutput = "I don't think that " + spokenWords + " is a character in the Star Wars universe. I've asked my data manager to investigate. " + actionQuery;
        }
        

        return handlerInput.responseBuilder
            .speak(changeVoice(speakOutput))
            .reprompt(changeVoice(actionQuery))
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
            .speak(changeVoice(speakOutput))
            .reprompt(changeVoice(speakOutput))
            .getResponse();
    }
};

const RandomItemIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RandomItemIntent';
    },
    async handle(handlerInput) {
        console.log(Alexa.getIntentName(handlerInput.requestEnvelope));
        var spokenType = getSpokenWords(handlerInput, "type");
        var resolvedType = getResolvedWords(handlerInput, "type");
        var spokenMedia = getSpokenWords(handlerInput, "media");
        var resolvedMedia = getResolvedWords(handlerInput, "media");
        var actionQuery = await getRandomSpeech("ActionQuery");
        var type;
        var item;
        var rb = handlerInput.responseBuilder;

        if (resolvedType != undefined) type = resolvedType[0].value.name;
        else type = getRandomItem(types);

        if (resolvedMedia != undefined) {
            item = await getRandomItemByCategory(type, resolvedMedia[0].value.name);
        }
        else {
            item = await getRandomItemByCategory(type);
        }
        //TODO: THIS IS A CHEAP, TIMESAVING HACK.  PLEASE FIX.
        if (item.fields.VoiceDescription === undefined) item.fields.VoiceDescription = item.fields.Name + ".  I don't have any information about this " + type + " yet.  My data is still being completed.  My apologies. " + actionQuery;

        var speakOutput = "I have chosen a " + type + " for you. " + item.fields.VoiceDescription + " " + actionQuery;
        if (item.fields.Image != undefined) {
            var imageURL = item.fields.Image[0].url;
            if (supportsAPL(handlerInput)) {
                var apl = require("apl/primary_image.json");
                apl.document.mainTemplate.items[0].items[1].headerTitle = item.fields.Name;
                apl.document.mainTemplate.items[0].items[2].items[0].source = imageURL;
                rb.addDirective({
                    type: 'Alexa.Presentation.APL.RenderDocument',
                    token: '[SkillProvidedToken]',
                    version: '1.0',
                    document: apl.document,
                    datasources: apl.datasources
                })
            }
            else {
                rb.withStandardCard(item.fields.Name, item.fields.CardDescription, imageURL, imageURL);
            }
        }

        return rb
            .speak(changeVoice(speakOutput))
            .reprompt(changeVoice(speakOutput))
            .getResponse();
    }
};

//TODO: Respond to the user after the trailer has completed.
const TrailerIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'TrailerIntent';
    },
    async handle(handlerInput) {
        console.log(Alexa.getIntentName(handlerInput.requestEnvelope));
        var speakOutput = "";
        var spokenWords = getSpokenWords(handlerInput, "media");
        var resolvedWords = getResolvedWords(handlerInput, "media");
        var actionQuery = await getRandomSpeech("ActionQuery");
        var rb = handlerInput.responseBuilder;
        
        if (resolvedWords != undefined) {
            var media = await getSpecificDataById("Media", resolvedWords[0].value.id);

            if (supportsVideo(handlerInput)) {
                actionQuery = "";
                //TODO: ADD TRIGGER TO SPEAK ACTIONQUERY AFTER VIDEO FINISHES.
                var apl = require("apl/videoplayer.json");
                apl.document.mainTemplate.items[0].items[0].source = media.fields.Trailer;
                rb.addDirective({
                    type: 'Alexa.Presentation.APL.RenderDocument',
                    token: '[SkillProvidedToken]',
                    version: '1.0',
                    document: apl.document,
                    datasources: apl.datasources
                })
            }
            else {
                speakOutput = "Your device doesn't support video, so I can't show you the trailer. " + " " + actionQuery;
            }
        }
        else {
            speakOutput = "You asked me for the trailer to " + spokenWords + ", but I don't think that's the name of a movie or television show from the Star Wars Universe. " + actionQuery;
        }

        return rb
            .speak(changeVoice(speakOutput))
            .reprompt(changeVoice(actionQuery))
            .getResponse();

    }
};

//TODO: Respond to the user after the crawl has completed.
const CrawlIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CrawlIntent';
    },
    async handle(handlerInput) {
        console.log(Alexa.getIntentName(handlerInput.requestEnvelope));
        console.log("SHOWING OPENING CRAWL");
        var speakOutput = "";
        var spokenWords = getSpokenWords(handlerInput, "media");
        var resolvedWords = getResolvedWords(handlerInput, "media");
        var actionQuery = await getRandomSpeech("ActionQuery");
        var rb = handlerInput.responseBuilder;
        
        if (resolvedWords != undefined) {
            var media = await getSpecificDataById("Media", resolvedWords[0].value.id);

            if (supportsVideo(handlerInput)) {

                if (media.fields.Crawl != undefined) {
                    actionQuery = "";
                    //TODO: ADD TRIGGER TO SPEAK ACTIONQUERY AFTER VIDEO FINISHES.
                    var apl = require("apl/videoplayer.json");
                    apl.document.mainTemplate.items[0].items[0].source = media.fields.Crawl;
                    rb.addDirective({
                        type: 'Alexa.Presentation.APL.RenderDocument',
                        token: '[SkillProvidedToken]',
                        version: '1.0',
                        document: apl.document,
                        datasources: apl.datasources
                    })
                }
                else {
                    speakOutput = "Unfortunately, there are only opening crawls for the 9 movies in the Star Wars saga. " + resolvedWords.value.name +  " doesn't have one. " + actionQuery;
                }
            }
            else if (supportsAPLT(handlerInput) != undefined) {
                //TODO: THIS DOESN'T ACTUALLY WORK YET.  PLEASE FIX.
                console.log("USING ECHO DOT WITH CLOCK");
                rb.addDirective({
                    "type": "Alexa.Presentation.APLT.RenderDocument",
                    "document": {
                        "type": "APLT",
                        "version": "1.0",
                        "mainTemplate": {
                            "items": [
                                {
                                    "type": "Text",
                                    "text" : "thIS IS yOUr APL",//media.fields.ClockCrawl,
                                    "overflow": "marquee",
                                    "msPerCharacter": 500
                                }
                            ]
                        }
                    },
                    "datasources": {}
                })
                speakOutput = media.fields.VoiceCrawl + " " + actionQuery;
            }
            else {
                console.log("NO DISPLAY CAPABILITIES.");
                speakOutput = media.fields.VoiceCrawl + " " + actionQuery;
            }
        }
        else {
            speakOutput = "You asked me for the opening crawl for " + spokenWords + ", but I don't think that's the name of a movie from the Star Wars saga, or one of the television shows. " + actionQuery;
        }

        return rb
            .speak(changeVoice(speakOutput))
            .reprompt(changeVoice(actionQuery))
            .getResponse();

    }
};
//TODO: Build an intent to let the user know what all of the categories are.
//TODO: Build an intent for all of the media that we support.
//TODO: Save the question we asked, so that we know they answered it correctly next time.
const QuizIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
        && Alexa.getIntentName(handlerInput.requestEnvelope) === 'QuizIntent';
    },
    async handle(handlerInput) {
        console.log(Alexa.getIntentName(handlerInput.requestEnvelope));
        var sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        var spokenMedia = getSpokenWords(handlerInput, "media");
        var resolvedMedia = getResolvedWords(handlerInput, "media");

        var spokenType = getSpokenWords(handlerInput, "type");
        var resolvedType = getResolvedWords(handlerInput, "type");

        var type = getRandomItem(types);
        var item;

        if ((spokenMedia != undefined)&&(resolvedMedia != undefined)) {
            item = await getRandomItemByCategory(type, resolvedMedia[0].value.name);
        }
        else if ((spokenType != undefined)&&(resolvedType != undefined)) {
            item = await getRandomItemByCategory(resolvedType[0].value.name);
            type = resolvedType[0].value.name;
        }
        else {
            item = await getRandomItemByCategory(type);
        }
        
        sessionAttributes.quizItem = item;
        sessionAttributes.quizType = type;

        //TODO: SHOW AN APL BUTTON THAT WILL REVEAL THE IMAGE AS A HINT ON DEVICES WITH SCREENS.
        const speakOutput = "I picked a " + type + ". " + item.fields.QuizDescription + " What am I thinking of?";

        return handlerInput.responseBuilder
            .speak(changeVoice(speakOutput))
            .reprompt(changeVoice(speakOutput))
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    async handle(handlerInput) {
        console.log(Alexa.getIntentName(handlerInput.requestEnvelope));
        const help = await getRandomSpeech("Help");
        const actionQuery = await getRandomSpeech("ActionQuery");

        var speakOutput = help + " " + actionQuery;

        return handlerInput.responseBuilder
            .speak(changeVoice(speakOutput))
            .reprompt(changeVoice(actionQuery))
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    async handle(handlerInput) {
        console.log(Alexa.getIntentName(handlerInput.requestEnvelope));
        const goodbye = await getRandomSpeech("Goodbye");

        return handlerInput.responseBuilder
            .speak(changeVoice(goodbye))
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
            .speak(changeVoice(speakOutput))
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
    async handle(handlerInput, error) {
        const actionQuery = await getRandomSpeech("ActionQuery");
        const speakOutput = "Uh, we had a slight weapons malfunction, but uh... everything's perfectly all right now. We're fine. We're all fine here now, thank you. " + actionQuery;
        console.log(`~~~~ Error handled: ${JSON.stringify(error.stack)}`);

        var airtable = await new Airtable({apiKey: process.env.airtable_key}).base(process.env.airtable_base_error);
        await airtable("Error").create({"JSON": JSON.stringify(handlerInput.requestEnvelope), "Stack": JSON.stringify(error.stack)}, function(err, record) {if (err) {console.error(err);}});

        return handlerInput.responseBuilder
            .speak(changeVoice(speakOutput))
            .reprompt(changeVoice(actionQuery))
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

async function getRandomItemByCategory(table, media) {
    var mediaquery = "";
    console.log("MEDIA = JJ" + media + "JJ");
    if (media != undefined) mediaquery = ",FIND(%22" + encodeURIComponent(media) + "%22%2C+Appearances)"

    const response = await httpGet(process.env.airtable_base_data, "&filterByFormula=AND(IsDisabled%3DFALSE()" + mediaquery + ")", table);
    const data = getRandomItem(response.records);
    console.log("RANDOM " + table.toUpperCase() + " = " + JSON.stringify(data));
    return data;
}

async function getItem(handlerInput, table){
    
    
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

function supportsVideo(handlerInput) {
    if (handlerInput
        && handlerInput.requestEnvelope
        && handlerInput.requestEnvelope.context
        && handlerInput.requestEnvelope.context.Viewport
        && handlerInput.requestEnvelope.context.Viewport.video) return true;
    return false;
}

function supportsAPL(handlerInput) {
    if (handlerInput
        && handlerInput.requestEnvelope
        && handlerInput.requestEnvelope.context
        && handlerInput.requestEnvelope.context.System
        && handlerInput.requestEnvelope.context.System.device
        && handlerInput.requestEnvelope.context.System.device.supportedInterfaces
        && handlerInput.requestEnvelope.context.System.device.supportedInterfaces["Alexa.Presentation.APL"]) return true;
    return false;
}

function supportsAPLT(handlerInput) {
    if (handlerInput
        && handlerInput.requestEnvelope
        && handlerInput.requestEnvelope.context
        && handlerInput.requestEnvelope.context.system
        && handlerInput.requestEnvelope.context.system.device
        && handlerInput.requestEnvelope.context.system.device.supportedInterfaces
        && handlerInput.requestEnvelope.context.system.device.supportedInterfaces["Alexa.Presentation.APLT"]) return true;
    return false;
}

function changeVoice(speech) {
    if (voice != "") {
        //console.log("<voice name='" + voice + "'>" + speech + "</voice>");
        return "<voice name='" + voice + "'><prosody rate='" + rate + "'>" + speech + "</prosody></voice>";
    }
    return speech;
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
        const pollyVoice = await httpGet(process.env.airtable_base_speech, "", "Voice");
        voice = pollyVoice.records[0].fields.Name;
        rate = pollyVoice.records[0].fields.Rate;
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
        TrailerIntentHandler,
        CrawlIntentHandler,
        MediaIntentHandler,
        RandomItemIntentHandler,
        QuizIntentHandler,
        ActorIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(ErrorHandler)
    .addRequestInterceptors(RequestLog)
    .addResponseInterceptors(ResponseLog)
    .withApiClient(new Alexa.DefaultApiClient())
    .lambda();
