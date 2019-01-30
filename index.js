const express = require('express');
const bodyParser = require('body-parser');
const dialogflow = require('dialogflow');
const uuid = require('uuid');
const port = process.env.PORT || 5000;

async function detectTextIntent(req, res, next) {
  const projectId = 'flights-ada2d';
  const text = req.query['text'];
  const languageCode = req.query['languageCode'];
  const short = req.query['short'] || 0;

  // A unique identifier for the given session
  const sessionId = uuid.v4();

  // Create a new session
  const sessionClient = new dialogflow.SessionsClient({
    keyFilename: './Flights-c5546a107b8d.json'
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
    if (!!short) {
      const result = responses[0].queryResult;
      const json = {
        query: result.queryText,
        response: result.fulfillmentText,
        intent: result.intent ? result.intent.displayName : 'No intent matched.'
      };
      res.status(200).json(json);
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
