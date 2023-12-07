const bcrypt = require('bcrypt')
const bcryptRounds = 12

module.exports = {
  getHash: async (plainTextPassword) => {
    try {
      const hash = await bcrypt.hash(plainTextPassword, bcryptRounds)
      return hash
    } catch (error) {
      throw new Error('Hash failed')
    }
  },

  compareHash: async (plainTextPassword, hash) => {
    try {
      const isMatch = await bcrypt.compare(plainTextPassword, hash)
      return isMatch
    } catch (error) {
      throw new Error('Comparison failed')
    }
  }
}
