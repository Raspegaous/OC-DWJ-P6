const passwordValidator = require('password-validator');
const valid = new passwordValidator();

valid
    .is().min(8).max(30)
    .has().lowercase().uppercase().digits().symbols();

module.exports = valid;