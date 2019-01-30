const express = require('express');
const bodyParser = require('body-parser');
const dialogflow = require('dialogflow');
const uuid = require('uuid');
const port = process.env.PORT || 5000;

/**
 * Send a query to the dialogflow agent, and return the query result.
 * @param {string} projectId The project to be used
 */
async function runSample() {
  const projectId = 'flights-ada2d';
  const query =
    'Find a flight from Dublin to Copenhagen on July 16, returning July 23, for 2 people.';
  const languageCode = 'en-US';
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
        text: query,
        // The language used by the client (en-US)
        languageCode: languageCode
      }
    }
  };

  // Send request and log result
  try {
    const responses = await sessionClient.detectIntent(request);
    console.log(JSON.stringify(responses));
    /*
    console.log('Detected intent');
    const result = responses[0].queryResult;
    console.log(`  Query: ${result.queryText}`);
    console.log(`  Response: ${result.fulfillmentText}`);
    if (result.intent) {
      console.log(`  Intent: ${result.intent.displayName}`);
    } else {
      console.log(`  No intent matched.`);
    }
    */
  } catch (error) {
    console.error(error);
  }
}

express()
  .use(bodyParser.json(), function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept'
    );
    next();
  })
  .get('/', (req, res) => res.status(200).json(runSample()))
  .listen(port, () => console.log(`Listening on ${port}`));
