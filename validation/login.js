const Validator = require('validator')
const isEmpty = require('./isEmpty')

module.exports = function validateLoginInput(data) {
  let errors = {}

  email = data.email
  password = data.password

  if(!Validator.isEmail(email)){
    errors.email = 'Not valid email'
  }

  if(!Validator.isLength(password, {min: 1})){
    errors.password = 'Password is required'
  }

  return {
    errors,
    isValid: isEmpty(errors)
  }
}
