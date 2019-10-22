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
  
  // Updates user row
  // user: {}
  updateUser : function(user){
    return db.update("users", user);
  },
  
  
  util: {
    user: require('../helpers/user')
  }

}
