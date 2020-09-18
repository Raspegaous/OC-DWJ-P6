const passwordValidator = require('password-validator');
const valid = new passwordValidator();

valid
    .is().min(8)
    .is().max(30)
    .has().lowercase()
    .has().uppercase()
    .has().digits()
    .has().symbols();

module.exports = valid;
