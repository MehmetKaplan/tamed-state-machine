const tsmb = require('../tamed-state-machine-backend');

const uiTexts = require('../ui-texts-english.json');
const sqls = require('../sqls.json');

const { runSQL, } = require('tamed-pg');

const tickLog = require('tick-log');
tickLog.forceColor(true);

let poolName;

const testExternalName = 'Test External Name';
const testExternalId = 'Test External Id';
const testExternalId2 = 'Test External Id2';
const testStateMachineName = 'Test State Machine for Document Approval';
const testGeneratedBy = 'Test Generated By';

let currentSMId;

beforeAll(async () => {
	await tsmb.init({
		pgKeys: {
			user: 'tsmapp',
			password: 'tsmapp.', // coming from database-setup/step00001.sql
			database: 'tsmdb',
			host: 'localhost',
			port: 5432,
		},
	});
	poolName = tsmb.exportedForTesting.poolInfoForTests.poolName;


	await runSQL(poolName, `update tsm.state_machines set name = $1 where name = $2`, [`NOT-USED-${new Date().toISOString()}`, testStateMachineName]);

	const currentSM = await runSQL(poolName, `insert into tsm.state_machines (name, description) values ($1, 'Test State Machine for Document Approval') returning id`, [testStateMachineName]);
	tickLog.info(`Generated new State Machine: ${JSON.stringify(currentSM.rows[0])}`, true);
	currentSMId = currentSM.rows[0].id;

	await runSQL(poolName, `insert into tsm.state_machine_states (sm_id, state, state_type, description) 
							values
								(${currentSMId}, 'Init', 'I', 'Initial State'),
								(${currentSMId}, 'Submitted', 'S', 'Submitted State'),
								(${currentSMId}, 'Approved', 'S', 'Approved State'),
								(${currentSMId}, 'Rejected', 'S', 'Rejected State'),
								(${currentSMId}, 'Closed', 'F', 'Final State')`);
	await runSQL(poolName, `insert into tsm.state_machine_state_transitions (sm_id, from_state, transition_name, to_state, pre_transition_task_name, post_transition_task_name) 
							values
								(${currentSMId}, 'Init', 'Submit', 'Submitted', 'preSubmit', 'postSubmit'),
								(${currentSMId}, 'Submitted', 'Approve', 'Approved', 'preApprove', 'postApprove'),
								(${currentSMId}, 'Submitted', 'Reject', 'Rejected', 'preReject', 'postReject'),
								(${currentSMId}, 'Approved', 'Modify', 'Submitted', 'preModify', 'postModify'),
								(${currentSMId}, 'Approved', 'Close', 'Closed', 'preClose', 'postClose'),
								(${currentSMId}, 'Rejected', 'Modify', 'Submitted', 'preModify', 'postModify'),
								(${currentSMId}, 'Rejected', 'Close', 'Closed', 'preClose', 'postClose')`);

});

jest.setTimeout(20000);

test('testHandler', async () => {
	const result = await tsmb.testHandler({ name: 'testHandler' });
	expect(result.result).toBe('OK');
	expect(result.payload.calledParameters.name).toBe('testHandler');
});
/*
test('smIdFromName', async () => {
	const result = await tsmb.exportedForTesting.smIdFromName(testStateMachineName);
	tickLog.info(`smIdFromName: ${JSON.stringify(result)}`, true);
	expect(result.result).toBe('OK');
	expect(result.payload).toBe(currentSMId);
});
*/
test('initiateInstance, getInstance and deleteInstance', async () => {
	const result = await tsmb.initiateInstance(testExternalName, testExternalId, testStateMachineName, testGeneratedBy)
	tickLog.info(`initiateInstance: ${JSON.stringify(result)}`, true);
	expect(result.result).toBe('OK');
	expect(result.payload).toBeFalsy();
	const result2 = await tsmb.getInstance(testExternalName, testExternalId, testStateMachineName);
	tickLog.info(`getInstance: ${JSON.stringify(result2)}`, true);
	expect(result.result).toBe('OK');
	expect(result2.payload.sm_id).toBe(currentSMId);
	try {
		const result3 = await tsmb.initiateInstance(testExternalName, testExternalId, testStateMachineName, testGeneratedBy)
		expect(true).toBe(false); // should not reach here
	} catch (e) {
		expect(e).toBe(uiTexts.existingInstanceFound);
	}
	const result4 = await tsmb.deleteInstance(testExternalName, testExternalId, testStateMachineName);
	tickLog.info(`deleteInstance: ${JSON.stringify(result4)}`, true);
	expect(result4.result).toBe('OK');
	expect(result4.payload).toBeFalsy();
	try {
		const result5 = await tsmb.getInstance(testExternalName, testExternalId, testStateMachineName);
		expect(true).toBe(false); // should not reach here
	} catch (e) {
		expect(e).toBe(uiTexts.noInstanceFound);
	}
});

test('Can not get non existing instance', async () => {
	try {
		const result = await tsmb.getInstance('NON-EXISTING', testExternalId, testStateMachineName);
		expect(true).toBe(false); // should not reach here
	} catch (e) {
		expect(e).toBe(uiTexts.noInstanceFound);
	}
});

test('Can not delete non existing instance', async () => {
	try {
		const result = await tsmb.deleteInstance('NON-EXISTING', testExternalId, testStateMachineName);
		expect(true).toBe(false); // should not reach here
	} catch (e) {
		expect(e).toBe(uiTexts.noInstanceFound);
	}
});

test('Check states of the state machine', async () => {
	const result = await tsmb.initiateInstance(testExternalName, testExternalId2, testStateMachineName, testGeneratedBy);
	tickLog.info(`initiateInstance: ${JSON.stringify(result)}`, true);
	expect(result.result).toBe('OK');
	expect(result.payload).toBeFalsy();
	const result2 = await tsmb.getPossibleTransitions(testExternalName, testExternalId2, testStateMachineName);
	tickLog.info(`getPossibleTransitions: ${JSON.stringify(result2)}`, true);
	expect(result2.result).toBe('OK');
	expect(result2.payload.length).toBe(1);
	expect(result2.payload[0].transition_name).toBe('Submit');
	const result3 = await tsmb.transitionInstance(testExternalName, testExternalId2, testStateMachineName, 'Submit', 'JEST-TEST', 'JEST-TEST');
	tickLog.info(`transitionInstance: ${JSON.stringify(result3)}`, true);
	expect(result3.result).toBe('OK');
	expect(result3.payload).toBeFalsy();
	const result4 = await tsmb.transitionInstance(testExternalName, testExternalId2, testStateMachineName, 'Reject', 'JEST-TEST', 'JEST-TEST');
	tickLog.info(`transitionInstance: ${JSON.stringify(result4)}`, true);
	expect(result4.result).toBe('OK');
	expect(result4.payload).toBeFalsy();
	const result5 = await tsmb.transitionInstance(testExternalName, testExternalId2, testStateMachineName, 'Modify', 'JEST-TEST', 'JEST-TEST');
	tickLog.info(`transitionInstance: ${JSON.stringify(result5)}`, true);
	expect(result5.result).toBe('OK');
	expect(result5.payload).toBeFalsy();
	const result6 = await tsmb.transitionInstance(testExternalName, testExternalId2, testStateMachineName, 'Approve', 'JEST-TEST', 'JEST-TEST');
	tickLog.info(`transitionInstance: ${JSON.stringify(result6)}`, true);
	expect(result6.result).toBe('OK');
	expect(result6.payload).toBeFalsy();
	const result7 = await tsmb.transitionInstance(testExternalName, testExternalId2, testStateMachineName, 'Modify', 'JEST-TEST', 'JEST-TEST');
	tickLog.info(`transitionInstance: ${JSON.stringify(result7)}`, true);
	expect(result7.result).toBe('OK');
	expect(result7.payload).toBeFalsy();
	try {
		const result7 = await tsmb.transitionInstance(testExternalName, testExternalId2, testStateMachineName, 'Close', 'JEST-TEST', 'JEST-TEST');
		expect(true).toBe(false); // should not reach here
	} catch (error) {
		expect(error).toBe(uiTexts.transitionNotAllowed);
	}

});

/*
	getInstanceHistory: getInstanceHistory,
*/