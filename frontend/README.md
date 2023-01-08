MODIFYME

## SETUP - FRONTEND

This is the frontend part of the `serial-entrepreneur` library. For full setup please refer to https://github.com/MehmetKaplan/serial-entrepreneur.

Following steps should lead you to prepare a proper frontend setup for the `serial-entrepreneur`. This frontend functions are designed to be pre-integrated with the backend functions out of the box, provided the setup steps are followed and a backend server, as shown in the backend library example, is run.

Add the pure JavaScript handlers into your frontend code. (*)

```bash
yarn add serial-entrepreneur-frontend
```

These pure JavaScript functions are designed to take the required parameters and additionally 2 functions, success and fail callbacks. With these callbacks you can use these functions within your frontend  button handlers.

0. Introduce the API backend and if reuired the debug mode.
   
	```javascript
	const serialEntrepreneurFrontendHandlers = require('serial-entrepreneur-frontend');
	serialEntrepreneurFrontendHandlers.init({
		apiBackend: apiBackend, // https://.....
		debugMode: false, // never keep this value true in production
	});
	```

1. Implement the [Register User] flow

	The [Register User] flow needs to have 2 steps. 
	
	1. Collect credentials and the minimum personal information from users.  
   
		The `serial-entrepreneur` gives you only these essential 3 information out of the box. In order to add additional information you'll need to enrich the `users` table in the database and add an initial page to collect those data. As a general principle, the less information you collect, the higher chance to comply with the privacy laws.
   		- name
         - email
         - password

		Once we collect them, we'll need `serial-entrepreneur-backend` to send a confirmation mail to the mail address, with a confirmation code.

		You can use following functions in your [Register User] page within the related submit button handler.
		```javascript
		const serialEntrepreneurFrontendHandlers = require('serial-entrepreneur-frontend');
		...

		// in your button's related event handler
		const fSuccess = (props, retval) => {
			// HANDLE YOUR SUCCESS CODE HERE
		}
		const fFail = (props, error) => {
			// HANDLE YOUR FAIL CODE HERE
		}
		await serialEntrepreneurFrontendHandlers.registerUserStep1(name, middlename, lastname, email, password, birthdate, gender, fSuccess, fFail);
		```
		#### `registerUserStep1` API

		| parameter | description |
		|-----------|-------------|
		| name | The name of the user |
		| middlename | The middle name of the user |
		| lastname | The last name / surname of the user |
		| email | The email that is to be registered |
		| password | The password that will be used while registering if the email is succesfully confirmed in the next step |
		| birthdate | The birth date of the user |
		| gender | The gender of the user |
		| fSuccess | callback to be called in success case |
		| fFail | callback to be called in fail case |

	2. Confirm the email.
 
	   Assuming the `serial-entrepreneur-backend` sent a confirmation mail to the mail address, next we need to verify the confirmation code which implies the mail is really owned by the user. If the user provides the correct confirmation code, the `serial-entrepreneur-backend` should save the user information to the database.

		You can use following functions in your [Confirmation Code Verification] page within the related submit button handler.
		```javascript
		const serialEntrepreneurFrontendHandlers = require('serial-entrepreneur-frontend');
		...

		// in your button's related event handler
		const fSuccess = (props, retval) => {
			// HANDLE YOUR SUCCESS CODE HERE
		}
		const fFail = (props, error) => {
			// HANDLE YOUR FAIL CODE HERE
		}
		await serialEntrepreneurFrontendHandlers.registerUserStep2(email, confirmationCode, fSuccess, fFail);
		```

		#### `registerUserStep2` API

		| parameter | description |
		|-----------|-------------|
		| email | The email that is to be registered |
		| confirmationCode | The confirmation code that the email recieved after the previous step<br>This code verifies the ownership of the mail |
		| fSuccess | callback to be called in success case |
		| fFail | callback to be called in fail case |


2. Implement the [Login] flow

	When a user succesfully registers, she/he should be able to login. For this we need to collect the email and password from the user and test if the credentials are correct. And if they are correct, we'll need to generate and store a `JWT` so that next time login is seamless for the user. Please check the `fSuccess` function in the below example in order to observe how the JWT can be obtained from the backend call response.

	You can use following functions in your [Login] page within the related submit button handler.
	
	```javascript
	const serialEntrepreneurFrontendHandlers = require('serial-entrepreneur-frontend');
	...

	// in your button's related event handler
	const fSuccess = (props, retval) => {
		// HANDLE YOUR SUCCESS CODE HERE
		let curJWT = retval.payload.token;
		// SAVE THE curJWT FOR NEXT LOGIN
	}
	const fFail = (props, error) => {
		// HANDLE YOUR FAIL CODE HERE
	}
	await serialEntrepreneurFrontendHandlers.loginUserViaMail(email, password, fSuccess, fFail);
	```
	#### `loginUserViaMail` API

	| parameter | description |
	|-----------|-------------|
	| email | The email that claims the login |
	| password | The password that authenticate the email |
	| fSuccess | callback to be called in success case |
	| fFail | callback to be called in fail case |

3. Implement the [Seamless Login] flow

	If the user logged in successfully and chose the "remember me" option, next time when she/he is logging in there should not be a need to collect credentials once again. And this is accomplished by saving the token when the user first logged in and refreshing it in each authentication event. Please check the `fSuccess` function in the below example in order to observe how the JWT can be obtained from the backend call response.

	You can use following functions in your [root (App.js)] page within the related life cycle (on load) handler or hook (useEffect).
	```javascript
	const serialEntrepreneurFrontendHandlers = require('serial-entrepreneur-frontend');
	...

	// in your button's related event handler
	const fSuccess = (props, retval) => {
		// HANDLE YOUR SUCCESS CODE HERE
		let curJWT = retval.payload.token;
		// SAVE (OVERWRITE) THE curJWT FOR NEXT LOGIN
	}
	const fFail = (props, error) => {
		// HANDLE YOUR FAIL CODE HERE
	}
	await serialEntrepreneurFrontendHandlers.loginUserViaToken(token, fSuccess, fFail);
	```
	#### `loginUserViaToken` API

	| parameter | description |
	|-----------|-------------|
	| token | The token that certifies the user |
	| fSuccess | callback to be called in success case |
	| fFail | callback to be called in fail case |

4. Implement the [Password Reset] flow

	One of the common functions to implement is the password reset, when a user completely forgets a password. Ownership of the registration email implies the ownership of the account, hence we want to provide a method for users to reset their passwords.

	This can be accomplished by 2 steps, similar to the registration flow.

	1. Get the password reset request.

		Collect the `email` for this purpose and generate a confirmation code at the backend for this request.

		You can use following functions in your [Forgot Password] page within the related submit button handler.
		```javascript
		const serialEntrepreneurFrontendHandlers = require('serial-entrepreneur-frontend');
		...

		// in your button's related event handler
		const fSuccess = (props, retval) => {
			// HANDLE YOUR SUCCESS CODE HERE
		}
		const fFail = (props, error) => {
			// HANDLE YOUR FAIL CODE HERE
		}
		await serialEntrepreneurFrontendHandlers.resetPasswordStep1(email, fSuccess, fFail);
		```
		#### `resetPasswordStep2` API

		| parameter | description |
		|-----------|-------------|
		| email | The email for which the password to be updated<br>This email is to recieve the confirmation code |
		| fSuccess | callback to be called in success case |
		| fFail | callback to be called in fail case |

	2. Check the confirmation code in order to verify the email ownership.

		You can use following functions in your [Forgot Password Confirmation Code Verification] page within the related submit button handler.
		```javascript
		const serialEntrepreneurFrontendHandlers = require('serial-entrepreneur-frontend');
		...

		// in your button's related event handler
		const fSuccess = (props, retval) => {
			// HANDLE YOUR SUCCESS CODE HERE
		}
		const fFail = (props, error) => {
			// HANDLE YOUR FAIL CODE HERE
		}
		await serialEntrepreneurFrontendHandlers.resetPasswordStep2(email, confirmationCode, newPassword, fSuccess, fFail);
		```
		#### `resetPasswordStep2` API

		| parameter | description |
		|-----------|-------------|
		| email | The email for which the password to be updated |
		| confirmationCode | The confirmation code that was sent to the email at previous step |
		| newPassword | The new password to be updated |
		| fSuccess | callback to be called in success case |
		| fFail | callback to be called in fail case |

5. Implement the [Change Password] flow

	We need to provide a method for the users to be able to change their users. For this purpose, we'll need to get the old password which justifies the users ownership of the account.

	You can use following functions in your [Change Password] page within the related submit button handler.
	```javascript
	const serialEntrepreneurFrontendHandlers = require('serial-entrepreneur-frontend');
	...

	// in your button's related event handler
	const fSuccess = (props, retval) => {
		// HANDLE YOUR SUCCESS CODE HERE
	}
	const fFail = (props, error) => {
		// HANDLE YOUR FAIL CODE HERE
	}
	await serialEntrepreneurFrontendHandlers.changePassword(token, oldPassword, newPassword, fSuccess, fFail);
	```
	#### `changePassword` API

	| parameter | description |
	|-----------|-------------|
	| token | The valid JWT of the user |
	| oldPassword | The old password to authenticate the user |
	| newPassword | The new password to be updated |
	| fSuccess | callback to be called in success case |
	| fFail | callback to be called in fail case |

6. Implement the [User Data Update] flow

	As stated previously the `serial-entrepreneur` collects as minimum data as possible from users. By default these data are `email` and `name` (a free text to keep whole name). In order to enrich the collected data the backend table should be added new columns. And those data should be updated seperately. But for the sake of the out of the box functionality `serial-entrepreneur` gives the update of the name field.
	
	You can use following functions in your [User Data Update] page within the related submit button handler.
	```javascript
	const serialEntrepreneurFrontendHandlers = require('serial-entrepreneur-frontend');
	...

	// in your button's related event handler
	const fSuccess = (props, retval) => {
		// HANDLE YOUR SUCCESS CODE HERE
	}
	const fFail = (props, error) => {
		// HANDLE YOUR FAIL CODE HERE
	}
	await serialEntrepreneurFrontendHandlers.updateUserData(token, newName, newmiddlename, newlastname, newbirthdate, newGender, fSuccess, fFail);
	```
	#### `updateUserData` API

	| parameter | description |
	|-----------|-------------|
	| token | The token that verifies the user |
	| newName | The new name to be updated |
	| newmiddlename | The new middle name to be updated |
	| newlastname | The new last name to be updated |
	| newbirthdate | The new birth date to be updated |
	| newGender | The new gender to be updated |
	| fSuccess | callback to be called in success case |
	| fFail | callback to be called in fail case |

7. Implement the [Remove User] flow

	In order to comply with some of the data privacy laws, we need to provide a method for users to completely remove their data. For this purpose we provide the user removing functionality.

	You can use following functions in your [Remove User] page within the related submit button handler.
	```javascript
	const serialEntrepreneurFrontendHandlers = require('serial-entrepreneur-frontend');
	...

	// in your button's related event handler
	const fSuccess = (props, retval) => {
		// HANDLE YOUR SUCCESS CODE HERE
	}
	const fFail = (props, error) => {
		// HANDLE YOUR FAIL CODE HERE
	}
	await serialEntrepreneurFrontendHandlers.removeUser(email, token, fSuccess, fFail);
	```
	#### `removeUser` API

	| parameter | description |
	|-----------|-------------|
	| email | The email that is to be removed |
	| token | The token that verifies the user |
	| fSuccess | callback to be called in success case |
	| fFail | callback to be called in fail case |


7. Implement the [Get User Data] flow

	You can use following functions in your [User Data] page within the related submit button handler.
	```javascript
	const serialEntrepreneurFrontendHandlers = require('serial-entrepreneur-frontend');
	...

	// in your button's related event handler
	const fSuccess = (props, retval) => {
		// HANDLE YOUR SUCCESS CODE HERE
		console.log(JSON.stringify(retval))
	}
	const fFail = (props, error) => {
		// HANDLE YOUR FAIL CODE HERE
	}
	await serialEntrepreneurFrontendHandlers.getUserData(token, fSuccess, fFail);
	```
	#### `getUserData` API

	| parameter | description |
	|-----------|-------------|
	| token | The token that verifies the user |
	| fSuccess | callback to be called in success case |
	| fFail | callback to be called in fail case |


### Integration with Popular Authentication Providers

On top of our mail based authentication, `expo` has wonderful integrations with common authentication providers. We strongly encourage you to check and use them from the following link: https://docs.expo.dev/guides/authentication/#guides


(*)
**Note**: Most modern frontend frameworks handle the `fetch` functionality. So we assumed it already exists. If you want to use the fuctions with `node.js` (for example for automated tests), be sure to use with version >= 18 where `fetch` is shipped by default.