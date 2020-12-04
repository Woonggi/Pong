const crypto = require('crypto');

module.exports = {
    /**
     * Builds a base-64-encoded SHA-256 hash of the provided message
     * @param {string} message data to be hashed
     * 
     * @returns {string} the base-64-encoded SHA-256 hash of the message
     */
   build_token: function (message) {
        // expanded to ease debuggability
        // could be compacted to: return crypto.createHash('sha256').update(message).digest('base64');
        let hash = crypto.createHash('sha256');
        hash.update(message);
        let token = hash.digest('base64');
        return token;
    }
}
