
module.exports = () => {
    const sqlite3 = require('sqlite3').verbose();
    let database;
    
    return{
        
        // Returns database event listener
        on: function(){
            return function(){};
            //return database.on;
        },
        
        // Opens the connection with the dB
        open: function(){
            return new Promise(resolve => {
                database = new sqlite3.Database(process.cwd()+"/data/db.db", (err) => {
                    if (err) {
                        return console.error(err.message);
                    }
                    console.log('Connected to the disk database');
                    resolve();
                });
            });
        },
        
        // Opens the conn with DB using async syntax
        // callback: ()
        aOpen: async function(callback){
            await open();
            callback();          
        },
        
        // Create table
        // name: str
        // columns: str[]
        createTable: function(name, columns){
            return new Promise(function(resolve,reject) {
                database.run(
                    "CREATE TABLE `"+name+"` ("
                        +"id INTEGER PRIMARY KEY, "
                        +"createTime DATETIME DEFAULT current_timestamp, "
                        +columns.join(',')
                        +")",
                    function(err){if (err) reject(err); else resolve()}
                );
            });
        },

        // Create table using async syntax
        // name: str
        // columns: str[]
        // callback: ()
        aCreateTable: async function (name, columns, callback){
            const done = await createTable(name, columns);
            callback();
        },
        
        // Create table if not exists
        // name: str
        // columns: str[]
        createTableIfNotExists: function(name, columns){
            return new Promise(function(resolve,reject) {
                database.run(
                    "CREATE TABLE IF NOT EXISTS `"+name+"` ("
                        +"id INTEGER PRIMARY KEY, "
                        +"createTime DATETIME DEFAULT current_timestamp, "
                        +columns.join(',')
                        +")",
                    function(err){if (err) reject(err); else resolve()}
                );
            });
        },

        // Updates data in table for row id
        // tableName: str
        // data: {row=>value, ...}
        update: function (tableName, data){
            let assigns = [];
            for (k in data){
                if (k === "id") return;
                assigns.push("`"+k+"`='"+data[k]+"'");
            }
            return new Promise(function (resolve, reject){
                database.run("UPDATE `"+tableName+"` SET ("+assigns.join(", ")+") WHERE id = ?", data.id, function(err){if (err) reject(err); else resolve()});
            });
        },

        // Inserts data into table
        // tableName: str
        // data: {row=>value, ...}
        insert: function (tableName, data){
            let rows = [];
            let values = [];
            for (k in data){
                rows.push(k);
                values.push(data[k]);
            }
            return new Promise(function (resolve, reject){
                database.run("INSERT INTO `"+tableName+"` (`"+rows.join('`, `')+"`) VALUES ('"+values.join("', '")+"')", function(err){if (err) reject(err); else resolve()});
            });
        },

        // Inserts or updates data into table
        // tableName: str
        // data: {row=>value, ...}
        replace: function (tableName, data){
            let rows = [];
            let values = [];
            for (k in data){
                rows.push(k);
                values.push(data[k]);
            }
            return new Promise(function (resolve, reject){
                database.run("REPLACE INTO `"+tableName+"` (`"+rows.join('`, `')+"`) VALUES ('"+values.join("', '")+"')", function(err){if (err) reject(err); else resolve()});
            });
        },

        // Inserts into table using async syntax
        // tableName: str
        // data: {row=>value, ...}
        // callback: ()
        aInsert: async function (tableName, data, callback){
            const done = await insert(tableName, data);
            callback();
        },

        // Gets data from the table
        // tableName: str
        // id: str
        // [columnName: str]
        get: function (tableName, id, columnName="id"){
            return new Promise(function (resolve, reject){
                database.get("SELECT FROM `"+tableName+"` WHERE "+columnName+"=?", id, function(err, row){if (err) reject(err); else resolve(row)});
            });
        },

        // Gets data from the table
        // tableName: str
        // parameters: {}
        find: function (tableName, parameters){
            let equalities = [];
            if (parameters){
                for (k in where){
                    equalities.push(k+" = "+parameters[k]);
                }
            }
            return new Promise(function (resolve, reject){
                database.get("SELECT FROM `"+tableName+"` WHERE "+equalities.join(" AND "), function(err, row){if (err) reject(err); else resolve(row)});
            });
        },
        
        // Gets multiple rows from the table
        // tableName: str
        // [groupBy: str]
        // [parameters: {}]
        findAll: function(tableName, groupBy=false, parameters=false){
            let equalities = [];
            if (parameters){
                for (k in parameters){
                    equalities.push(k+" = "+parameters[k]);
                }
            }
            return new Promise(function (resolve, reject){
                database.all(
                    "SELECT FROM `"+tableName+"`" 
                    + (parameters ? "WHERE "+equalities.join(" AND ") : "")
                    + (groupBy ? "GROUP BY "+groupBy : ""), 
                    function(err, rows){if (err) reject(err); else resolve(rows)}
                );
            });
        },
        
        // Gets multiple rows from the table
        // tableName: str
        // [groupBy: str]
        getAll: function(tableName, groupBy=false){
            return new Promise(function (resolve, reject){
                database.all(
                    "SELECT FROM `"+tableName+"`" 
                    + (groupBy ? "GROUP BY "+groupBy : ""), 
                    function(err, rows){if (err) reject(err); else resolve(rows)}
                );
            });
        },

        // Deletes data from the table
        // tableName: str
        // id: str
        // [columnName: str]
        remove: function (tableName, id, columnName="id"){
            return new Promise(function (resolve, reject){
                database.run("DELETE FROM `"+tableName+"` WHERE "+columnName+"=?", id, function(err, row){if (err) reject(err); else resolve()});
            });
        },
        
        // Closes the db connection
        close: function (){
            database.close();
        }
    }
}