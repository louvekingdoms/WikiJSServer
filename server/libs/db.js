'use strict'

/* global ROOTPATH, appconfig, winston */

const db = require('../helpers/db')()
const fs = require('fs')
const path = require('path')
const _ = require('lodash')

/**
 * SQDB module
 *
 * @return     {Object}  SQLite wrapper instance
 */
module.exports = {

  /**
   * Initialize DB
   *
   * @return     {Object}  DB instance
   */
  init() {
    let self = this    
    db.on('trace', data => {
      winston.log(data)
    });

    self.db = db;
    self.onReady = db.open();
    
    
    return self
  },
  
  // Returns user by id
  // id: int
  findUserById : function(id){
    return db.get("users", id);
  },
  
  // Returns uplfile by id
  // id: int
  findUplFileById : function(id){
    return db.get("uplfile", id);
  },
  
  // Returns uplfile by uid
  // uid: str
  findUplFileByUid: function(uid){
    return db.get("uplfile", uid, "uid");
  },
  
  // Finds a single user by object similarity
  // parameters = {}
  findUserByParameters: function(parameters){
    return db.find("users", parameters);
  },
  
  // Returns entry by id
  // id: int
  findEntryById : function(id){
    return db.get("entry", id);
  },
  
  getEntriesGroupedBy: function(column){
    return db.getAll("entry", column);
  },
  
  // Updates user row
  // user: {}
  updateUser : function(user){
    return db.update("users", user);
  },
  
  // Updates user row by email
  // user: {}
  updateUserByMail : function(user){
    return db.update("users", user, "mail");
  },
  
  // Finds uplfolder by folder name
  // name: str
  findUplFolderByName : function(name){
    return db.get("uplfolder", name);
  },
  
  // Updates or inserts upl folder
  // folder: {}
  updateOrInsertUplFolder : function(folder){
    return db.replace("uplfolder", folder);
  },
  
  // Updates entry row
  // entry: {}
  updateEntry : function(entry){
    if (!entry.path) console.trace(entry);
    return db.update("entry", entry);
  },
  
  // Updates or inserts entry row
  // entry: {}
  updateOrInsertEntry : function(entry){
    if (!entry.path) console.trace(entry);
    return db.replace("entry", entry);
  },
  
  // Finds entries per parent path
  // parentPath: str
  findEntriesByParentPath: function(parentPath){
    return db.findAll("entry", false, {"parentPath":parentPath});
  },
  
  // Finds a single entry per parent path
  // parentPath: str
  findEntryByParentPath: function(parentPath){
    return db.get("entry", parentPath, "parentPath");
  },
  
  // Finds a single entry per object similarity
  // parameters = {}
  findEntryByParameters: function(parameters){
    return db.find("entry", parameters);
  },
  
  deleteEntryByPath: function (path){
    return db.remove("entry", path, "path");
  },
  
  deleteUplFileById: function (id){
    return db.remove("uplfile", id);
  },
  
  deleteUplFileByUid: function (uid){
    return db.remove("uplfile", uid, "uid");
  },
  
  deleteAllUplFolders: function (){
    return db.truncate("uplfolder");
  },
  
  deleteAllUplFiles: function (){
    return db.truncate("uplfile");
  },
  
  deleteAllEntries: function (){
    return db.truncate("entry");
  },
  
  // Add multiple folders to the uplfolder table
  // folders: str[]
  createMultipleUplFolders: function(folders){
    if (!folders) return Promise.resolve();
    let promises = [];
    for (let k in folders){
        const name = folders[k];
        if (!name) continue;
        promises.push(db.insert("uplfolder", {name: name}));
    }
    return Promise.all(promises);
  },
  
  // Updates or inserts uplfile row
  // uplfile: {}
  updateOrInsertUplFile : function(uplfile){
    return db.replace("uplfile", uplfile);
  },
  
  // Add multiple files to the uplfile table
  // files: {}[]
  createMultipleUplFiles: function(files){
    if (!files) return Promise.resolve();
    let promises = [];
    for (let k in files){
        const file = files[k];
        if (!file) continue;
        promises.push(db.insert("uplfile", file));
    }
    return Promise.all(promises);
  },
  
  util: {
    user: require('../helpers/user')
  }

}
