
module.exports = () => {
    const sqlite3 = require('sqlite3').verbose();
    let database;
    
    return{
        
        // Returns database event listener
        on: function(){
            return database.on;
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
                database.run("CREATE TABLE `"+name+"` (id INTEGER PRIMARY KEY, "+columns.join(',')+")", function(err){if (err) reject(err); else resolve()});
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
        // id: int
        get: function (tableName, id){
            return new Promise(function (resolve, reject){
                database.run("SELECT FROM `"+tableName+"` WHERE id="+id+"", function(err, row){if (err) reject(err); else resolve(row)});
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
        
        // Closes the db connection
        close: function (){
            database.close();
        }
    }
}