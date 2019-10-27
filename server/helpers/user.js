
const bcrypt = require('bcryptjs-then')

module.exports = {    
    // Promise
    hashPassword: function (rawPwd) {
      return bcrypt.hash(rawPwd)
    },
    
    // Promise
    validatePassword: function (rawPwd, storedHash) {
      return bcrypt.compare(rawPwd, storedHash).then((isValid) => {
        return (isValid) ? true : Promise.reject(new Error(lang.t('auth:errors:invalidlogin')))
      })
    }
    
    
}