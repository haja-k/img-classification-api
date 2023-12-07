const LdapAuth = require('ldapauth-fork')
const appRoot = require('app-root-path')
const logger = require(`${appRoot}/src/plugins/logger`)
const fileName = __filename.split(require('path').sep).pop()
const directory = __dirname.split(require('path').sep).pop()
// TODO: replace with company credentials
const ldapConfig = {
  url: 'ldap://ldap.xxx:333',
  bindDN: 'uid=adad,o=sadaasd,o=ddsaddd',
  bindCredentials: 'g0g0sss', // process.env.PASSWORD;
  searchBase: 'o=vdsvgfhyth,o=sadascdacac',
  searchFilter: '(uid={{username}})',
  reconnect: true
}

let ldap

module.exports = {
  init: () => {
    ldap = new LdapAuth(ldapConfig)
    ldap.on('error', (err) => {
      logger.error(`[${directory}/${fileName}/init] LdapAuth: ${err}`)
    })
  },

  authenticate: async (username, password) => {
    try {
      const user = await new Promise((resolve, reject) => {
        ldap.authenticate(username, password, (err, user) => {
          if (err) {
            if (err.code === 49) {
              logger.error(`[${directory}/${fileName}/authenticate] LDAP authentication failed: User does not exist or invalid credentials.`)
              return reject(new Error('User not found or invalid credentials'))
            } else {
              logger.error(`[${directory}/${fileName}/authenticate] LDAP authentication error: ${err}`)
              return reject(err)
            }
          }
          logger.info(`[${directory}/${fileName}/authenticate] LDAP authenticating ${user.sn} (${user.uid}), ${user.employeeType} employee of ${user.ou} based in ${user.l}.`)
          resolve(user)
        })
      })
      return module.exports._promiseTimeout(5000, user, `Cannot authenticate ${username} with LDAP`)
    } catch (error) {
      logger.error(`[${directory}/${fileName}/authenticate] Catching err exception: ${error}`)
      return {
        error: true,
        message: `${error}`
      }
    }
  },

  close: () => {
    ldap.close((err) => {
      if (err) logger.error(`[${directory}/${fileName}/close] On close: ${err}`)
    })
  },

  _promiseTimeout: (ms, promise, errorString) => {
    return Promise.race([
      promise,
      new Promise((_resolve, reject) => {
        setTimeout(() => {
          reject(errorString)
        }, ms)
      })
    ])
  }
}
