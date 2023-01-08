### State Machine Configuration Manual

The `tamed-state-machine` module provides a state machine engine to manage the state of a business object. The state machine engine is configured using the following tables.


#### `state_machines`

This table holds the human understandable name and description of the state machine.

**Important:** One `name` entry should have at most 1 `'Y'` row (but can have multiple `'N'` entries, which is why a db constraint is not implemented).

| Column | Type | Description |
| --- | --- | --- |
| id | Integer | Internal, do not touch during insert. Primary key of the table. |
| name | String | Name of the state machine. |
| description | String | Description of the state machine. |
| valid | varchar(1) | Default `'Y'`. Whether the state machine is valid or not.|

#### `state_machine_states`

This table holds the states and description of the state machines.

**Important 1:** There should be one `'I'` (initial) and one `'F'` (final) state configuration.
**Important 2:** One `sm_id, state` entry should have at most 1 `'Y'` row (but can have multiple `'N'` entries, which is why a db constraint is not implemented).

| Column | Type | Description |
| --- | --- | --- |
| id | Integer | Internal, do not touch during insert. Primary key of the table. |
| sm_id | Integer | Foreign key to `state_machines.id`. |
| state | String | Name of the state. |
| state_type | String | Type of the state. Can be `'I'` (initial), `'S'` (state), or `'F'` (final). |
| description | String | Description of the state. |
| valid | varchar(1) | Default `'Y'`. Whether the state is valid or not.|

### `state_machine_state_transitions`

This table holds the transitions between states and the task pointers to be executed before and after the transition.

The task pointers are the names of the JavaScript functions of your frontend application. The `tamed-state-machine-frontend` module will call these functions with the following parameters ***automatically*** as defined in the [tamed-state-machine-frontend](https://github.com/MehmetKaplan/tamed-state-machine/blob/master/frontend/README.md) module:

* pre_transition_task_name: The function name in the frontend application that is to be called before the transition.
* post_transition_task_name: The function name in the frontend application that is to be called after the transition.

| Column | Type | Description |
| --- | --- | --- |
| id | Integer | Internal, do not touch during insert. Primary key of the table. |
| sm_id | Integer | Foreign key to `state_machines.id`. |
| from_state | String | Name of the state from which the transition starts. |
| transition_name | String | Name of the transition. |
| to_state | String | Name of the state to which the transition ends. |
| pre_transition_task_name | String | Name of the function in the frontend application that is to be called before the transition. |
| post_transition_task_name | String | Name of the function in the frontend application that is to be called after the transition. |


### Example

For a better understanding of how to use this library, please refer to [this example](https://github.com/MehmetKaplan/tamed-state-machine/blob/master/example/README.md).

### License

The license is MIT and full text [here](https://github.com/MehmetKaplan/tamed-state-machine/blob/master/LICENSE).

