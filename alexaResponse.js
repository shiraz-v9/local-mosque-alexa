module.exports.alexaResponse = (handlerInput, response) => {
  console.log("boooooooom");
  return (
    handlerInput.responseBuilder
      .speak(response)
      //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
      .getResponse()
  );
};
