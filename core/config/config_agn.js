const current = 'agn_dev';

const config_mysql = {

    agn_dev: {
        // MySQL: {
        //     host: 'localhost',
        //     puerto: 3306,
        //     usuario: 'matgomez',
        //     password: 'Hola.1234',
        //     database: 'agn200_desa_db'
        // }
        MySQL: {
            host: '192.168.242.69',
            puerto: 3306,
            usuario: 'agn_user',
            password: 'H0l4.2020%',
            database: 'agn'
        }
    },

    mgo_dev: {
        MySQL: {
            host: 'localhost',
            puerto: 3306,
            usuario: 'root',
            password: 'abc1234',
            database: 'agn_vida'
        }
    },

    lucas_dev: {
        // MySQL: {
        //     host: 'localhost',
        //     puerto: 3306,
        //     usuario: 'lucas',
        //     password: 'lucas',
        //     database: 'agnbicentenario'
        // }
        MySQL: {
            host: '192.168.242.69',
            puerto: 3306,
            usuario: 'agn_user',
            password: 'H0l4.2020%',
            database: 'agn'
        }
    },

    facundo_dev: {
        MySQL: {
            host: 'localhost',
            puerto: 3306,
            usuario: 'maldonado',
            password: 'maldonado',
            database: 'agnbicentenario'
        }
    }

}


module.exports = config_mysql[current];