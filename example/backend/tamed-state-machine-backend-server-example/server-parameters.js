// MODIFY this file to change the server parameters
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
