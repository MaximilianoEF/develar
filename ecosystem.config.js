module.exports = {
	apps : [{
	  name   : "agn",
	  script : "./bin/www",
	  env: {
			  NODE_ENV: "production",
			  PORT: "8080",
			  DBASE: "agndb",
			  SERVER: "https://agn200.mininterior.gob.ar",
			  FAVICON: "favicon.ico",
			  PUBLIC: "/www/agn"
	  }
	}]
  }