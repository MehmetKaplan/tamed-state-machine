## WHY?

This is the backend part of the `tamed-state-machine` library. For full setup please refer to https://github.com/MehmetKaplan/tamed-state-machine.

This, `tamed-state-machine-backend` library, is a set of functions that read the state machine configurations within the database. And associate your application's objects with those state machines.

As a general rule this association is defined by following 3 parameters, which you can see frequently in the function parameters:

1. `externalName` - Connection to your application. This information is valuable for you, it defines which application you are connecting. The value is free text and `tamed-state-machine` keeps it for your association. (For example if you are implementing a document approval process, this is the name of the application that you are implementing the process for).
2. `externalId` - Connection to your application, here the value is usually the primary key of the connected document. (For example if you are implementing a document approval process, this is the **internal id of the document in your application**).
3. `smName` - Name of the state machine that is configured within the database. In order to see how the state machines can be configured, please refer to the [state machine configuration manual](../database-setup/README-SM-CONFIG.md).

**Note:** *Whenever the database is modified with new state machines, states, transitions, etc, the backend server will be able to read and use the definitions since we do not cache the state machine configurations. The rationale behind this is that we do not want to restart the backend server each time a new state machine is defined.*

Once these functions are exposed as a backend server, they can be consumed by the `tamed-state-machine-frontend` functions.

**IMPORTANT: This library does not focus on the authorization. It should be handled separately.**

### API

#### `init`

| Parameter | Type | Description |
| --- | --- | --- |
| p_params | Object | Parameters for the backend server. |

`p_params`

| Key | Type | Value |
| --- | --- | --- |
| pgKeys | Object | PostgreSQL connection parameters. |
| applicationName | String | Application name. Not used, reserved for future. |
#### `initiateInstance`

Initializes a state machine instance. This instance is association between your application and a configured state machine.

| Parameter | Type | Description |
| --- | --- | --- |
| externalName| String | Connection to an application, here the value is a free-text. |
| externalId | String | Connection to an application, here the value is usually the primary key of the connected document. (For example if you are implementing a document approval process, this is the internal id of the document). |
| smName| String | Name of the state machine that is configured within the database. |
| generatedBy| String | The user that initiated the state machine. |

#### `getInstance`

Gets the instance of the state machine. This instance is association between your application and a configured state machine.

| Parameter | Type | Description |
| --- | --- | --- |
| externalName| String | Connection to an application, here the value is a free-text. |
| externalId | String | Connection to an application, here the value is usually the primary key of the connected document. (For example if you are implementing a document approval process, this is the internal id of the document). |
| smName| String | Name of the state machine that is being queried. |

#### `getPossibleTransitions`

Finds the state machine instance and returns the possible transitions for the current state.

| Parameter | Type | Description |
| --- | --- | --- |
| externalName| String | Connection to an application, here the value is a free-text. |
| externalId | String | Connection to an application, here the value is usually the primary key of the connected document. (For example if you are implementing a document approval process, this is the internal id of the document). |
| smName| String | Name of the state machine that the current state transitions are being queried. |

#### `transitionInstance`

Finds the state machine instance and performs the desired transition.

| Parameter | Type | Description |
| --- | --- | --- |
| externalName| String | Connection to an application, here the value is a free-text. |
| externalId | String | Connection to an application, here the value is usually the primary key of the connected document. (For example if you are implementing a document approval process, this is the internal id of the document). |
| smName| String | Name of the state machine that the state is requested to be transitioned. |
| transitionName| String | Name of the transition that is being requested. |
| transitionMadeBy| String | The user that requested the transition. |
| comment| String | Comment for the transition for instance history. |

#### `getInstanceHistory`

Finds the state machine instance and returns the history of the transitions.

| Parameter | Type | Description |
| --- | --- | --- |
| externalName| String | Connection to an application, here the value is a free-text. |
| externalId | String | Connection to an application, here the value is usually the primary key of the connected document. (For example if you are implementing a document approval process, this is the internal id of the document). |
| smName| String | Name of the state machine that the history is being queried. |

#### `getAllPossibleTransitions`

Gives the state machine transition configurations.

| Parameter | Type | Description |
| --- | --- | --- |
| smName| String | Name of the state machine that the transitions are being queried. |

#### `deleteInstance`

Deletes the state machine instance.

| Parameter | Type | Description |
| --- | --- | --- |
| externalName| String | Connection to an application, here the value is a free-text. |
| externalId | String | Connection to an application, here the value is usually the primary key of the connected document. (For example if you are implementing a document approval process, this is the internal id of the document). |
| smName| String | Name of the state machine that the instance is being deleted. |



### SETUP

1. Add the request handlers as a dependency of your project.

```bash
yarn add tamed-state-machine-backend
```

2. Initialize parameters (modify below object according to your environment)

Name below example configuration as `server-parameters.js` and place it in the root directory of your express server. This file is to be `require`d by your express server in the next step. **You should modify the credentials, according to your environment.**

```javascript
module.exports = {
	pgKeys: {
		user: 'tsmapp',
		password: 'tsmapp.', // coming from database-setup/step00001.sql
		database: 'tsmdb',
		host: 'localhost',
		port: 5432,
	},
	httpsKeys: {
		keyPath: undefined, // modify this if https is to be used
		certPath: undefined, // modify this if https is to be used
	},
	port: process.env.TSM_PORT || 3000
}
```

3. Call the `init` function of the library to initialize the db connection pool.

```javascript
const serialEntrepreneurBackendHandlers = require('tamed-state-machine-backend');
const serverParameters = require('./server-parameters.js');
...
const startServer = async () => {
	await tsmb.init(
		{
			pgKeys: serverParameters.pgKeys,
			applicationName: 'YOUR APPLICATION NAME',
		}
	);
	// ...
	// Rest of your application server code
}
```

4. Finally start your server. Now the state machine backend is ready to be consumed by the frontend.

5. Each time you need a state machine model configure it in the database as in the [state machine configuration manual](../database-setup/README-SM-CONFIG.md)

### Example

For a better understanding of how to use this library, please refer to [this example](../example/README.md).

### License

The license is MIT and full text [here](LICENSE).

#### Used Modules

* tick-log license [here](../OtherLicenses/tick-log.txt)
* tamed-pg license [here](../OtherLicenses/tamed-pg.txt)
* fetch-lean license [here](../OtherLicenses/fetch-lean.txt)
