
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
    },
    
    processProfile: (profile) => {
        let primaryEmail = ''
        let name = ''
        // Shenanigans to get email and name accross all services whatever their API sends
        if (_.isArray(profile.emails)) {
            let e = _.find(profile.emails, ['primary', true])
            primaryEmail = (e) ? e.value : _.first(profile.emails).value
        } else if (_.isString(profile.email) && profile.email.length > 5) {
            primaryEmail = profile.email
        } else if (_.isString(profile.mail) && profile.mail.length > 5) {
            primaryEmail = profile.mail
        } else if (profile.user && profile.user.email && profile.user.email.length > 5) {
            primaryEmail = profile.user.email
        } else if (_.isString(profile.unique_name) && profile.unique_name.length > 5) {
            primaryEmail = profile.unique_name
        } else {
            return Promise.reject(new Error(lang.t('auth:errors.invaliduseremail')))
        }

        profile.provider = _.lowerCase(profile.provider)
        primaryEmail = _.toLower(primaryEmail)

        // Same for name
        if (_.has(profile, 'displayName')) {
            name = profile.displayName
        } else if (_.has(profile, 'name')) {
            name = profile.name
        } else if (_.has(profile, 'cn')) {
            name = profile.cn
        } else {
            name = _.split(primaryEmail, '@')[0]
        }

        return db.updateUserByParameters({
            mail: primaryEmail,
            name
        }).then((user) => {
            return user || Promise.reject(new Error(lang.t('auth:errors:notyetauthorized')))
        })
    }
    
    
}