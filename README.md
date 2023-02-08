### Why?

One of the frequently encountered problems in software development is the need to handle the state machines. Even though the state machine concept is straight forward, handling them is usually hard and open to errors, considering possible points that require intensive care. In order to reduce this repetitive work of handling state machines with the needed intensive care, this project was created. 

This project is a state machine handler that is based on a PostgresSQL database. The state machine is defined in the database and the code that handles it is generated from the database. *Please note, this library is **not** a state machine visualization library.*

The functions of this library can be comprehended best by walking through a working example because there are 3 distinct parts that need to be understood:
- Database (state machine configuration)
- Backend (state machine info exposure)
- Frontend (the application interface that use the state machine information).

A working example is described [here](https://github.com/MehmetKaplan/tamed-state-machine/blob/master/example/README.md).

### Requirements

1. An Ubuntu server with `bash` shell.
2. A PostgresSQL database (the installation method is below, in the `Install DB` section, below. )

### Setup

#### 1. Install DB

`tamed-state-machine` requires PostgreSQL. If not already installed you can refer to https://www.postgresql.org/ for installation.

For the DB setup follow [the steps mentioned here](https://github.com/MehmetKaplan/tamed-state-machine/blob/master/database-setup/README.md).

#### 2. Prepare Backend

For setting up the fundamentals of the backend follow [the steps mentioned here](https://github.com/MehmetKaplan/tamed-state-machine/blob/master/backend/README.md).

#### 3. Prepare Frontend

The frontend functions are handlers that can be embedded into any client application that connects to the backend. This can be a real frontend app like the ones written with, react, react-native or expo. On the other hand there is no limitation for this library for frontend to be a presentation layer. That's why it can also be a backend node application as well. 

For setting up the fundamentals of the frontend follow [the steps mentioned here](https://github.com/MehmetKaplan/tamed-state-machine/blob/master/frontend/README.md).

### Example

For a better understanding of how to use this library, please refer to [this example](https://github.com/MehmetKaplan/tamed-state-machine/blob/master/example/README.md).

### License

The license is MIT and full text [here](https://github.com/MehmetKaplan/tamed-state-machine/blob/master/LICENSE).

#### Used Modules

* fetch-lean license [here](./OtherLicenses/fetch-lean.txt)
* tamed-pg license [here](./OtherLicenses/tamed-pg.txt)
* tick-log license [here](./OtherLicenses/tick-log.txt)

