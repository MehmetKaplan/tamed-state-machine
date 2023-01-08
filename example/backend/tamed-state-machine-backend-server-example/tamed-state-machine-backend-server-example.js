const express = require('express');
const app = express();
const https = require('https');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const tickLog = require('tick-log');
const tsmb = require('tamed-state-machine-backend');

const serverParameters = require('./server-parameters.js');

const getParams = (body, query) => {
	if ((body) && (Object.keys(body).length > 0)) return body;
	return query;
}

const callHandler = async (req, res, handler, paramsArr) => {
	const params = getParams(req.body, req.query);
	try {
		let paramsToSend = [];
		for (let i = 0; i < paramsArr.length; i++) {
			paramsToSend.push(params[paramsArr[i]]);
		}
		let l_result = await tsmb[handler](...paramsToSend); // never use the return value, they are to be used for testing only
		let l_responseJSON = {
			result: 'OK'
		}
		if (l_result?.payload) l_responseJSON.payload = l_result.payload; // CHECK-BEFORE-BUILD Remove from README.md
		if (l_result?.rows) l_responseJSON.rows = l_result.rows;
		res.json(l_responseJSON);
	} catch (error) {
		res.json({
			result: 'FAIL',
			error: error
		});
	}
}

const startServer = async () => {
	await tsmb.init(
		{
			pgKeys: serverParameters.pgKeys,
			applicationName: 'YOUR APPLICATION NAME',
		}
	);

	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(morgan('combined'));
	app.use(cors());
	app.options('*', cors());

	// http://localhost:3000/testHandler?test=123
	app.all('/testHandler', async (req, res) => { callHandler(req, res, 'testHandler', ['test']) });
	app.post('/getInstance', async (req, res) => { callHandler(req, res, 'getInstance', ['externalName', 'externalId', 'smName']) });
	app.post('/initiateInstance', async (req, res) => { callHandler(req, res, 'initiateInstance', ['externalName', 'externalId', 'smName', 'generatedBy']) });
	app.post('/deleteInstance', async (req, res) => { callHandler(req, res, 'deleteInstance', ['externalName', 'externalId', 'smName']) });
	app.post('/getPossibleTransitions', async (req, res) => { callHandler(req, res, 'getPossibleTransitions', ['externalName', 'externalId', 'smName']) });
	app.post('/transitionInstance', async (req, res) => { callHandler(req, res, 'transitionInstance', ['externalName', 'externalId', 'smName', 'transitionName', 'transitionMadeBy', 'comment']) });
	app.post('/getInstanceHistory', async (req, res) => { callHandler(req, res, 'getInstanceHistory', ['externalName', 'externalId', 'smName']) });
	app.post('/getAllPossibleTransitions', async (req, res) => { callHandler(req, res, 'getAllPossibleTransitions', ['smName']) });

	if ((serverParameters.httpsKeys.keyPath) && (serverParameters.httpsKeys.certPath)) {
		// if there are keys and certificates, use them
		https.createServer({
			key: fs.readFileSync(serverParameters.httpsKeys.keyPath),
			cert: fs.readFileSync(serverParameters.httpsKeys.certPath)
		}, app).listen(serverParameters.port, () => {
			tickLog.success(`HTTPS server listening on port ${serverParameters.port}.`);
		});
	}
	else {
		// In localhost go only for HTTP not HTTPS
		app.listen(serverParameters.port, () => {
			tickLog.success(`HTTP server listening on port ${serverParameters.port}.`);
		});
	}
}

startServer();
