\connect tsmdb;

--   ____ _                 _                  _                   
--  / ___| | ___  __ _ _ __(_)_ __   __ _     / \   _ __ ___  __ _ 
-- | |   | |/ _ \/ _` | '__| | '_ \ / _` |   / _ \ | '__/ _ \/ _` |
-- | |___| |  __/ (_| | |  | | | | | (_| |  / ___ \| | |  __/ (_| |
--  \____|_|\___|\__,_|_|  |_|_| |_|\__, | /_/   \_\_|  \___|\__,_|
--                                  |___/

-- TABLES 
revoke all on tsm.instance_history
from
	tsmapp;

drop table tsm.instance_history;

revoke all on tsm.instances
from
	tsmapp;

drop table tsm.instances;

revoke all on tsm.state_machine_state_transitions
from
	tsmapp;

drop table tsm.state_machine_state_transitions;

revoke all on tsm.state_machine_states
from
	tsmapp;

drop table tsm.state_machine_states;

revoke all on tsm.state_machines
from
	tsmapp;

drop table tsm.state_machines;


-- SCHEMA

drop schema if exists tsm;

revoke connect on database "tsmdb"
from
	tsmapp;

drop user if exists tsmapp;