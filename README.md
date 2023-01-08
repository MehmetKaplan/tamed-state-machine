### Why?

One of the frequently encountered problems in software development is the need to handle state machines. The state machines are usually complex and the code that handles them is mostly complex as well. The common reason for complexity of the code is due to the fact that the code is hard to structure well.

In order to reduce the repetitive work of handling state machines, this project was created. The project is a state machine handler that is based on a PostgresSQL database. The state machine is defined in the database and the code that handles it is generated from the database.
### Requirements

1. An Ubuntu server with `bash` shell.
2. A PostgresSQL database (the installation method is below, in the `Install DB` section, below. )


### Setup

#### 1. Install DB

`tamed-state-machine` requires PostgreSQL. If not already installed you can refer to https://www.postgresql.org/ for installation.

For the DB setup follow [the steps mentioned here](./database-setup/README.md).

#### 2. Prepare Backend

For setting up the fundamentals of the backend follow [the steps mentioned here](./backend/README.md).

#### 3. Prepare Frontend

The frontend functions are handlers that can be embedded into any client application that connects to the backend. This can be a real frontend app like the ones written with, react, react-native or expo. On the other hand there is no limitation for this library for frontend to be a presentation layer. That's why it can also be a backend node application as well. 

For setting up the fundamentals of the frontend follow [the steps mentioned here](./frontend/README.md).

### License

The license is MIT and full text [here](LICENSE).

#### Used Modules

* tick-log license [here](./OtherLicenses/tick-log.txt)
* tamed-pg license [here](./OtherLicenses/tamed-pg.txt)
* fetch-lean license [here](./OtherLicenses/fetch-lean.txt)

