const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const dialogflow = require('dialogflow');
const uuid = require('uuid');
const port = process.env.PORT || 5000;
const structjson = require('./structjson.js');

function logQueryResult(sessionClient, result) {
  // Instantiates a context client
  const contextClient = new dialogflow.ContextsClient({
    keyFilename: path.join(__dirname + '/Flights-c5546a107b8d.json')
  });

  const parameters = structjson.structProtoToJson(result.parameters);

  const contextObj = {
    id: '',
    lifespan: '',
    parameters: []
  };

  if (result.outputContexts && result.outputContexts.length) {
    result.outputContexts.forEach(context => {
      contextObj.id = contextClient.matchContextFromContextName(context.name);
      contextObj.lifespan = context.lifespanCount;
      contextObj.parameters = [
        ...contextObj.parameters,
        structjson.structProtoToJson(context.parameters)
      ];
    });
  }

  const json = {
    query: result.queryText,
    response: result.fulfillmentText,
    intent: result.intent ? result.intent.displayName : 'No intent matched.',
    parameters: parameters,
    context: contextObj
  };

  return json;
}

async function detectTextIntent(req, res, next) {
  const projectId = 'flights-ada2d';
  const text = req.query['text'];
  const languageCode = req.query['languageCode'];
  const short = req.query['short'] || 0;

  // A unique identifier for the given session
  const sessionId = uuid.v4();

  // Create a new session
  const sessionClient = new dialogflow.SessionsClient({
    keyFilename: path.join(__dirname + '/Flights-c5546a107b8d.json')
  });
  const sessionPath = sessionClient.sessionPath(projectId, sessionId);
  // The text query request.
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        // The query to send to the dialogflow agent
        text: text,
        // The language used by the client (en-US)
        languageCode: languageCode
      }
    }
  };

  // Send request and log result
  try {
    const responses = await sessionClient.detectIntent(request);
    if (!!Number(short)) {
      const response = responses[0];
      const result = logQueryResult(sessionClient, response.queryResult);
      res.status(200).json(result);
    } else {
      res.status(200).json(responses);
    }
  } catch (e) {
    next(e);
  }
}

express()
  .use(bodyParser.json(), (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept'
    );
    next();
  })
  .post('/', async (req, res, next) => detectTextIntent(req, res, next))
  .listen(port, () => console.log(`Listening on ${port}`));
