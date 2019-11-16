

function trace(a, t=""){
    a = a.slice(0);
    a.pop();
    const d = {info: console.log};
    let w = d;
    if (typeof winston !== 'undefined') w = winston;
    w.info("[SQL "+t.toUpperCase()+"] "+a.join(", "));
}

function quoteIfNotString(a){
    return ((
        isNaN(a) || (a == null) || (a === '')
    ) ? "'"+a+"'" : a)+"";
}

module.exports = () => {
    const fs = require('fs');
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
                const realDB = new sqlite3.Database(process.cwd()+"/data/db.db", (err) => {
                    if (err) {
                        return console.error(err.message);
                    }
                    trace(['Connected to the disk database', null]);
                    
                    database = {
                        run: function(...args){trace(args, "run"); realDB.run.apply(realDB, args);},
                        get: function(...args){trace(args, "get"); realDB.get.apply(realDB, args);},
                        all: function(...args){trace(args, "all"); realDB.all.apply(realDB, args);},
                        close: function(...args){trace(args, "close"); realDB.close.apply(realDB, args);},
                    }                    
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

        // Updates data in table for row determined by given information
        // tableName: str
        // data: {row=>value, ...}
        // [column: str]
        update: function (tableName, data, column="id"){
            let assigns = [];
            for (k in data){
                if (k === column) return;
                assigns.push("`"+k+"`="+quoteIfNotString(data[k]));
            }
            return new Promise(function (resolve, reject){
                database.run("UPDATE `"+tableName+"` SET ("+assigns.join(", ")+") WHERE "+column+" = ?", data[column], function(err){if (err) reject(err); else resolve()});
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
                values.push(quoteIfNotString(data[k]));
            }
            return new Promise(function (resolve, reject){
                database.run("INSERT INTO `"+tableName+"` (`"+rows.join('`, `')+"`) VALUES ("+values.join(", ")+")", function(err){if (err) reject(err); else resolve()});
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
                values.push(quoteIfNotString(data[k]));
            }
            return new Promise(function (resolve, reject){
                database.run("REPLACE INTO `"+tableName+"` (`"+rows.join('`, `')+"`) VALUES ("+values.join(", ")+")", function(err){if (err) reject(err); else resolve()});
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
                database.get("SELECT * FROM `"+tableName+"` WHERE "+columnName+"=?", id, function(err, row){if (err) reject(err); else resolve(row)});
            });
        },

        // Gets data from the table
        // tableName: str
        // parameters: {}
        find: function (tableName, parameters){
            let equalities = [];
            if (parameters){
                for (k in parameters){
                    equalities.push(k+" = "+quoteIfNotString(parameters[k]));
                }
            }
            return new Promise(function (resolve, reject){
                database.get("SELECT * FROM `"+tableName+"` WHERE "+equalities.join(" AND "), function(err, row){if (err) reject(err); else resolve(row)});
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
                    equalities.push(k+" = "+quoteIfNotString(parameters[k]));
                }
            }
            return new Promise(function (resolve, reject){
                database.all(
                    "SELECT * FROM `"+tableName+"`" 
                    + (parameters ? " WHERE "+equalities.join(" AND ") : "")
                    + (groupBy ? " GROUP BY "+groupBy : ""), 
                    function(err, rows){
                        if (err){
                            console.trace("ERR");
                            console.log(err);
                            reject(err); 
                        }
                        else {
                            resolve(rows)
                        }
                    }
                );
            });
        },
        
        // Gets multiple rows from the table
        // tableName: str
        // [groupBy: str]
        getAll: function(tableName, groupBy=false){
            return new Promise(function (resolve, reject){
                database.all(
                    "SELECT * FROM `"+tableName+"`" 
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

        // Empties a table
        // tableName: str
        truncate: function (tableName){
            return new Promise(function (resolve, reject){
                database.run("DELETE FROM `"+tableName+"`", function(err, row){if (err) reject(err); else resolve()});
            });
        },
        
        // Closes the db connection
        close: function (){
            database.close();
        }
    }
}