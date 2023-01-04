cat step0000* > tsmdb.sql
remote-psql-runner.sh tsmdb.sql
rm tsmdb.sql
