const fetchLean = require('fetch-lean');
const tickLog = require('tick-log');

const keys = {};

let debugMode = false;

const preFunctions = {};
const postFunctions = {};

const init = (p_params) => new Promise(async (resolve, reject) => {
	try {
		keys.apiBackend = p_params.apiBackend;
		Object.assign(preFunctions, p_params?.preFunctions ? p_params.preFunctions : /* istanbul ignore next */ {});
		Object.assign(postFunctions, p_params?.postFunctions ? p_params.postFunctions :  /* istanbul ignore next */ {});
		debugMode = p_params?.debugMode;
		return resolve(true);
	} catch (error) /* istanbul ignore next */ {
		return reject("Unknown error");
	}
});

// template for all calls to the backend
const tamedStateMachineBackendCall = (method, route, props, successCallback, failCallback) => new Promise(async (resolve, reject) => {
	let retVal;
	let l_url = `${keys.apiBackend}/${route}`;
	/* istanbul ignore if */
	if (debugMode) tickLog.start(`tamedStateMachineBackendCall ${method} ${l_url}`);
	try {
		retVal = await fetchLean(method, l_url, {}, props);
		if (retVal.result === 'OK') {
			successCallback(props, retVal); // IF THIS FAILS, the failCallback to be called from the catch block below
			return resolve(retVal);
		};
		failCallback(props, retVal);
		return reject(retVal);
	} catch (e) /* istanbul ignore next */ {
		tickLog.error(`tamedStateMachineBackendCall failed.\nMethod: ${method}\nRoute: ${route}\nretVal:${JSON.stringify(retVal, null, '  ')}\nError: ${JSON.stringify(e, null, '  ')}`);
		if (debugMode) tickLog.error(`props: ${JSON.stringify(props, null, '  ')}`);
		failCallback(props, e);
		return reject(e);
	}
});

const testHandler = async (test, successCallback, failCallback) => { await tamedStateMachineBackendCall('POST', 'testHandler', { test }, successCallback, failCallback); }
const getInstance = async (externalName, externalId, smName, successCallback, failCallback) => { await tamedStateMachineBackendCall('POST', 'getInstance', { externalName, externalId, smName }, successCallback, failCallback); }
const initiateInstance = async (externalName, externalId, smName, generatedBy, successCallback, failCallback) => { await tamedStateMachineBackendCall('POST', 'initiateInstance', { externalName, externalId, smName, generatedBy }, successCallback, failCallback); }
const deleteInstance = async (externalName, externalId, smName, successCallback, failCallback) => { await tamedStateMachineBackendCall('POST', 'deleteInstance', { externalName, externalId, smName }, successCallback, failCallback); }
const getPossibleTransitions = async (externalName, externalId, smName, successCallback, failCallback) => { await tamedStateMachineBackendCall('POST', 'getPossibleTransitions', { externalName, externalId, smName }, successCallback, failCallback); }

const transitionInstance = (externalName, externalId, smName, transitionName, transitionMadeBy, comment, possibleTransitions = undefined, successCallback, failCallback) => new Promise(async (resolve, reject) => {
	let preTransitionTaskName = undefined;
	let postTransitionTaskName = undefined;
	let resVal = {};
	if (possibleTransitions) {
		// Example data: { "id": 869, "sm_id": 128, "from_state": "Init", "transition_name": "Submit", "to_state": "Submitted", "pre_transition_task_name": "preSubmit", "post_transition_task_name": "postSubmit" }]
		const transitionConfig = possibleTransitions.filter((transition) => transition.transition_name === transitionName);
		/* istanbul ignore else */ 
		if (transitionConfig && transitionConfig.length === 1) {
			preTransitionTaskName = transitionConfig[0].pre_transition_task_name;
			postTransitionTaskName = transitionConfig[0].post_transition_task_name;
		}
	}
	if (preTransitionTaskName) {
		try {
			resVal.preFuncResult = await preFunctions[preTransitionTaskName]({ externalName, externalId, smName, transitionName, transitionMadeBy, comment });
		} catch (error) /* istanbul ignore next */ {
			tickLog.error(`preTransitionTaskName failed. preTransitionTaskName: ${preTransitionTaskName}, error: ${JSON.stringify(error)}`);
			return reject(error);
		}
	}
	await tamedStateMachineBackendCall('POST', 'transitionInstance', { externalName, externalId, smName, transitionName, transitionMadeBy, comment }, successCallback, failCallback);
	if (postTransitionTaskName) {
		try {
			resVal.postFuncResult = await postFunctions[postTransitionTaskName]({ externalName, externalId, smName, transitionName, transitionMadeBy, comment });
		} catch (error) /* istanbul ignore next */ {
			tickLog.error(`postTransitionTaskName failed. postTransitionTaskName: ${postTransitionTaskName}, error: ${JSON.stringify(error)}`);
			return reject(error);
		}
	}
	return resolve(resVal);
});

const getInstanceHistory = async (externalName, externalId, smName, successCallback, failCallback) => {
	await tamedStateMachineBackendCall('POST', 'getInstanceHistory', { externalName, externalId, smName }, successCallback, failCallback);
}
const getAllPossibleTransitions = async (smName, successCallback, failCallback) => { await tamedStateMachineBackendCall('POST', 'getAllPossibleTransitions', { smName }, successCallback, failCallback); }

module.exports = {
	init: init,
	testHandler: testHandler,
	getInstance: getInstance,
	initiateInstance: initiateInstance,
	deleteInstance: deleteInstance,
	getPossibleTransitions: getPossibleTransitions,
	transitionInstance: transitionInstance,
	getInstanceHistory: getInstanceHistory,
	getAllPossibleTransitions: getAllPossibleTransitions,
	exportedForTesting: {
	}
}