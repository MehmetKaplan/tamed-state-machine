## WHY?

This is the frontend part of the `tamed-state-machine` library. For full setup please refer to https://github.com/MehmetKaplan/tamed-state-machine.

This, `tamed-state-machine-frontend` library, is a set of functions that communicate with a backend that utilize `tamed-state-machine-backend` library to expose the state machine functionality. 

Altogether these libraries give a generic method to handle most state machine related tasks.

The frontend functions are handlers that can be embedded into any client application that connects to the backend. This can be a real frontend app like the ones written with, react, react-native or expo. On the other hand there is no limitation for this library for frontend to be a presentation layer. That's why it can also be a backend node application as well. 

One of the important features of this library is that it helps you to call pre and post functions just before and right after state machine transitions. The pre and post functions are your frontend application's functions and their names are defined in the database as described in the [state machine configuration manual](https://github.com/MehmetKaplan/tamed-state-machine/blob/master/database-setup/README-SM-CONFIG.md).

**Note:** *Whenever the database is modified with new state machines, states, transitions, etc, the backend server will be able to read and use the definitions since we do not cache the state machine configurations. The rationale behind this is that we do not want to restart the backend server each time a new state machine is defined.*

You can use the following functions defined in the **API** section to present state machine to your end users.

**IMPORTANT: This library does not focus on the authorization. It should be handled separately.**

## SETUP

1. Add the request handlers as a dependency of your project.

```bash
yarn add tamed-state-machine-frontend
```

2. Include the `tamed-state-machine-frontend` library in your project.

```javascript
const tamedStateMachineFrontendHandlers = require('https://github.com/MehmetKaplan/tamed-state-machine/blob/master/tamed-state-machine-frontend');
```
3. Define the backend url.

```javascript
const apiBackend = 'http://...'; // modify this with your backend that utilize the tamed-state-machine-backend library
```

4. Define your pre transition and post transition functions. 

```javascript
const pre1 = (props) => { return "pre1 is called" }
const pre2 = (props) => { return "pre2 is called" }
//...
const post1 = (props) => { return "post1 is called" }
const post2 = (props) => { return "post2 is called" }
//...
```

5. Register your pre and post transition functions and backend API to the library.

```javascript
tamedStateMachineFrontendHandlers.init({
	apiBackend: apiBackend,
	preFunctions: {
		"pre1": pre1
		"pre2": pre2
	},
	postFunctions: {
		"post1": post1
		"post2": post2
	}
});
```

6. Now the state machine frontend is ready to be consumed by your application.

### API

#### Callbacks

For all functions (except the `init` function), there are 2 callback functions that should be passed as parameters. These functions are `successCallback` and `failCallback`. These functions are called when the function is successful or not successful respectively with following parameters:
  * `props`: the data that is posted to the backend
  * `retval`: the data that is returned from the backend. The details are as described in the **API** section of the [`tamed-state-machine-backend` library](https://github.com/MehmetKaplan/tamed-state-machine/blob/master/backend/README.md). You can refer to `Returns` subsection for each route.

#### `init`

This function should be called before any other function. It initializes the library with the backend url and pre and post transition functions.

| Parameter | Type | Description |
| --- | --- | --- |
| p_params | Object | The object that contains the backend url and pre and post transition functions. |

`p_params` should have following format:

| Key | Type | Description |
| --- | --- | --- |
| apiBackend | String | The backend url. |
| preFunctions | Object | The object that contains the pre transition functions. |
| postFunctions | Object | The object that contains the post transition functions. |

`preFunctions` and `postFunctions` should have following format:

The below `Key for "Function Name"` is the name of the function that will be called before or after the transition. It is configured in the database as stated in the [state machine configuration manual](https://github.com/MehmetKaplan/tamed-state-machine/blob/master/database-setup/README-SM-CONFIG.md).

| Key | Type | Description |
| --- | --- | --- |
| Key for "Function Name" | Function | The function that will be called before or after the transition. |

###### Returns

If successful, resolves to `true`
If not successful, rejects with an error message.

#### `initiateInstance`

Initializes a state machine instance. This instance is association between your application and a configured state machine.

| Parameter | Type | Description |
| --- | --- | --- |
| externalName| String | Connection to an application, here the value is a free-text. |
| externalId | String | Connection to an application, here the value is usually the primary key of the connected document. (For example if you are implementing a document approval process, this is the internal id of the document). |
| smName| String | Name of the state machine that is configured within the database. |
| generatedBy| String | The user that initiated the state machine. |
| successCallback | Function | Callback function that is called when the function is successful as described above in the **Callbacks** section. |
|failCallback | Function | Callback function that is called when the function fails as described above in the **Callbacks** section. |
#### `getInstance`

Gets the instance of the state machine. This instance is association between your application and a configured state machine.

| Parameter | Type | Description |
| --- | --- | --- |
| externalName| String | Connection to an application, here the value is a free-text. |
| externalId | String | Connection to an application, here the value is usually the primary key of the connected document. (For example if you are implementing a document approval process, this is the internal id of the document). |
| smName| String | Name of the state machine that is being queried. |
| successCallback | Function | Callback function that is called when the function is successful as described above in the **Callbacks** section. |
|failCallback | Function | Callback function that is called when the function fails as described above in the **Callbacks** section. |

#### `getPossibleTransitions`

Finds the state machine instance and returns the possible transitions for the current state.

| Parameter | Type | Description |
| --- | --- | --- |
| externalName| String | Connection to an application, here the value is a free-text. |
| externalId | String | Connection to an application, here the value is usually the primary key of the connected document. (For example if you are implementing a document approval process, this is the internal id of the document). |
| smName| String | Name of the state machine that the current state transitions are being queried. |
| successCallback | Function | Callback function that is called when the function is successful as described above in the **Callbacks** section. |
|failCallback | Function | Callback function that is called when the function fails as described above in the **Callbacks** section. |

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
| possibleTransitions | Array | Array of possible transitions for the current state. This should be obtained prior to calling `transitionInstance` from previous `transitionInstance` or `initiateInstance` calls. If this value is provided, the pre and post functions are called. |
| successCallback | Function | Callback function that is called when the function is successful as described above in the **Callbacks** section. |
|failCallback | Function | Callback function that is called when the function fails as described above in the **Callbacks** section. |

#### `getInstanceHistory`

Finds the state machine instance and returns the history of the transitions.

| Parameter | Type | Description |
| --- | --- | --- |
| externalName| String | Connection to an application, here the value is a free-text. |
| externalId | String | Connection to an application, here the value is usually the primary key of the connected document. (For example if you are implementing a document approval process, this is the internal id of the document). |
| smName| String | Name of the state machine that the history is being queried. |
| successCallback | Function | Callback function that is called when the function is successful as described above in the **Callbacks** section. |
|failCallback | Function | Callback function that is called when the function fails as described above in the **Callbacks** section. |

#### `getAllPossibleTransitions`

Gives the state machine transition configurations.

| Parameter | Type | Description |
| --- | --- | --- |
| smName| String | Name of the state machine that the transitions are being queried. |
| successCallback | Function | Callback function that is called when the function is successful as described above in the **Callbacks** section. |
|failCallback | Function | Callback function that is called when the function fails as described above in the **Callbacks** section. |

#### `deleteInstance`

Deletes the state machine instance.

| Parameter | Type | Description |
| --- | --- | --- |
| externalName| String | Connection to an application, here the value is a free-text. |
| externalId | String | Connection to an application, here the value is usually the primary key of the connected document. (For example if you are implementing a document approval process, this is the internal id of the document). |
| smName| String | Name of the state machine that the instance is being deleted. |
| successCallback | Function | Callback function that is called when the function is successful as described above in the **Callbacks** section. |
|failCallback | Function | Callback function that is called when the function fails as described above in the **Callbacks** section. |

### Example

For a better understanding of how to use this library, please refer to [this example](https://github.com/MehmetKaplan/tamed-state-machine/blob/master/example/README.md).

### License

The license is MIT and full text [here](https://github.com/MehmetKaplan/tamed-state-machine/blob/master/LICENSE).

#### Used Modules

* tick-log license [here](https://github.com/MehmetKaplan/tamed-state-machine/blob/master/OtherLicenses/tick-log.txt)
* tamed-pg license [here](https://github.com/MehmetKaplan/tamed-state-machine/blob/master/OtherLicenses/tamed-pg.txt)
* fetch-lean license [here](https://github.com/MehmetKaplan/tamed-state-machine/blob/master/OtherLicenses/fetch-lean.txt)
