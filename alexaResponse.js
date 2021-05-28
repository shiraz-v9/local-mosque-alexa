module.exports.alexaResponse = (handlerInput, response) => {
  return (
    handlerInput.responseBuilder
      .speak(response)
      //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
      .getResponse()
  );
};
