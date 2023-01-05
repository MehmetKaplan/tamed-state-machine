const tickLog = require('tick-log');

const { connect, runSQL } = require('tamed-pg');

const sqls = require('./sqls.json');
const uiTexts = require('./ui-texts-english.json');

const keys = {};

let poolName;

const poolInfoForTests = {};

const init = (p_params) => new Promise(async (resolve, reject) => {
	try {
		poolName = await connect(p_params.pgKeys);
		poolInfoForTests.poolName = poolName;
		/* istanbul ignore next */
		uiTexts.applicationName = p_params?.applicationName ? p_params?.applicationName : uiTexts.applicationName;
		return resolve(true);
	} catch (error) /* istanbul ignore next */ {
		tickLog.error(`Function init failed. Error: ${JSON.stringify(error)}`, true);
		return reject(uiTexts.unknownError);
	}
});

/* istanbul ignore next */
const testHandler = (props) => new Promise(async (resolve, reject) => {
	try {
		tickLog.info(`testHandler: name: ${JSON.stringify(props)}`, true);
		return resolve({
			result: 'OK',
			payload: {
				calledParameters: props
			},
		});
	} catch (error) {
		return reject(error);
	}
});

const smIdFromName = (smName) => new Promise(async (resolve, reject) => {
	try {
		const smDef = await runSQL(poolName, sqls.getSM, [smName]);
		/* istanbul ignore if */
		if (smDef.rows.length === 0) return reject(uiTexts.noSMfound);
		/* istanbul ignore if */
		if (smDef.rows.length > 1) return reject(uiTexts.multipleSMfound);
		const smId = smDef.rows[0].id;
		return resolve({
			result: 'OK',
			payload: smId,
		});
	} catch (e) /* istanbul ignore next */{
		tickLog.error(`smIdFromName failed. Error: ${JSON.stringify(e)}`, true);
		return reject(e);
	}
});

const getInstance = (externalName, externalId, smName) => new Promise(async (resolve, reject) => {
	try {
		const smFN = await smIdFromName(smName);
		const smId = smFN.payload;
		const instances = await runSQL(poolName, sqls.getInstance, [externalName, externalId, smId]);
		/* istanbul ignore if */
		if (instances.rows.length === 0) return reject(uiTexts.noInstanceFound);
		/* istanbul ignore if */
		if (instances.rows.length > 1) return reject(uiTexts.multipleInstancesFound);
		return resolve({
			result: 'OK',
			payload: instances.rows[0]
		});
	} catch (error) /* istanbul ignore next */{
		return reject(error);
	}
});

const initiateInstance = (externalName, externalId, smName, generatedBy) => new Promise(async (resolve, reject) => {
	try {
		const smFN = await smIdFromName(smName);
		const smId = smFN.payload;

		try {
			const existingInstance = await getInstance(externalName, externalId, smName);
			return reject(uiTexts.existingInstanceFound);
		}
		catch (error) { 
			// do nothing, this is expected
		}

		const smInitialState = await runSQL(poolName, sqls.getSMInitialState, [smId]);
		/* istanbul ignore if */
		if (smInitialState.rows.length === 0) return reject(uiTexts.noInitialStateFound);
		/* istanbul ignore if */
		if (smInitialState.rows.length > 1) return reject(uiTexts.multipleInitialStatesFound);
		const initialState = smInitialState.rows[0].state;

		await runSQL(poolName, sqls.initiateInstance, [externalName, externalId, smId, initialState, generatedBy]);
		const existingInstance2 = await getInstance(externalName, externalId, smName);
		const instanceId = existingInstance2.payload.id;

		await runSQL(poolName, sqls.addTransitionHistory, [instanceId, initialState, 'instance initiated', generatedBy, 'instance initiated']);

		return resolve({
			result: 'OK',
			payload: undefined,
		});
	} catch (error) /* istanbul ignore next */{
		return reject(error);
	}
});

const deleteInstance = (externalName, externalId, smName) => new Promise(async (resolve, reject) => {
	try {
		const existingInstance = await getInstance(externalName, externalId, smName);
		const instanceId = existingInstance.payload.id;
		await runSQL(poolName, sqls.deleteInstance, [instanceId]);
		return resolve({
			result: 'OK',
			payload: undefined,
		});
	} catch (error) {
		return reject(error);
	}
});

const getPossibleTransitions = (externalName, externalId, smName) => new Promise(async (resolve, reject) => {
	try {
		const existingInstance = await getInstance(externalName, externalId, smName);
		const smId = existingInstance.payload.sm_id;
		const smState = existingInstance.payload.sm_state;

		const possibleTransitions = await runSQL(poolName, sqls.getPossibleTransitions, [smId, smState]);
		return resolve({
			result: 'OK',
			payload: possibleTransitions.rows
		});
	} catch (error) /* istanbul ignore next */ {
		return reject(error);
	}
});

const transitionInstance = (externalName, externalId, smName, transitionName, transitionMadeBy, comment) => new Promise(async (resolve, reject) => {
	try {
		/* istanbul ignore if */
		if (comment.length > 200) return reject(uiTexts.commentTooLong);

		const possibleTransitions_ = await getPossibleTransitions(externalName, externalId, smName);
		const possibleTransitions = possibleTransitions_.payload;
		const targetStateRows = possibleTransitions.filter(r => r.transition_name === transitionName);
		if (targetStateRows.length === 0) return reject(uiTexts.transitionNotAllowed); // can not have more than 1 because of database constraint
		const toState = targetStateRows[0].to_state;

		const existingInstance = await getInstance(externalName, externalId, smName);
		const instanceId = existingInstance.payload.id;

		await runSQL(poolName, sqls.setInstanceNewState, [toState, instanceId]);
		await runSQL(poolName, sqls.addTransitionHistory, [instanceId, toState, transitionName, transitionMadeBy, comment]);
		return resolve({
			result: 'OK',
			payload: undefined,
		});
	} catch (error) /* istanbul ignore next */ {
		return reject(error);
	}
});

const getInstanceHistory = (externalName, externalId, smName) => new Promise(async (resolve, reject) => {
	try {
		const existingInstance = await getInstance(externalName, externalId, smName);
		const instanceId = existingInstance.payload.id;

		const instanceHistory = await runSQL(poolName, sqls.getInstanceHistory, [instanceId]);
		return resolve({
			result: 'OK',
			payload: instanceHistory.rows,
		});
	} catch (error) /* istanbul ignore next */{
		return reject(error);
	}
});

module.exports = {
	init: init,
	testHandler: testHandler,
	getInstance: getInstance,
	initiateInstance: initiateInstance,
	deleteInstance: deleteInstance,
	getPossibleTransitions: getPossibleTransitions,
	transitionInstance: transitionInstance,
	getInstanceHistory: getInstanceHistory,
	exportedForTesting: {
		poolInfoForTests: poolInfoForTests,
		smIdFromName: smIdFromName,
	}
}
