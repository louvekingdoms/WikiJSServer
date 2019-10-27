'use strict'

/* global ROOTPATH, appconfig, winston */

const db = require('../helpers/db')
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
  
  // Updates entry row
  // entry: {}
  updateEntry : function(entry){
    return db.update("entry", entry);
  },
  
  // Updates entry row
  // entry: {}
  updateOrInsertEntry : function(entry){
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
  
  // Finds a single entry per parent path
  // parameters = {}
  findEntryByParameters: function(parameters){
    return db.find("entry", parameters);
  },
  
  deleteEntryByPath: function (path){
    return db.remove("entry", path, "path");
  },
  
  
  util: {
    user: require('../helpers/user')
  }

}
