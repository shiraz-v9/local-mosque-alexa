module.exports.getPrevious = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "getPrevious"
    );
  },
  async handle(handlerInput) {
    console.log("\n HI im getPrevious");
  },
};
