const Validator = require('validator')
const isEmpty = require('./isEmpty')
module.exports = function validateRegisterInput(data){
  let errors = {}

  data.name = !isEmpty(data.name) ? data.name : ''
  data.email = !isEmpty(data.email) ? data.email : ''
  data.password = !isEmpty(data.password) ? data.password : ''
  data.confirmPass = !isEmpty(data.confirmPass) ? data.confirmPass : ''

  if(!Validator.isLength(data.name, {min: 2, max: 30})){
    errors.name = 'Name must be between 2 and 30 characters'
  }

  if(!Validator.isEmail(data.email)) {
    errors.email = 'Not valid email format'
  }

  if(!Validator.isLength(data.password, {min: 6, max: 30})) {
    errors.password = 'Password needs at least 6 characters'
  }

  if(!Validator.equals(data.password, data.confirmPass)) {
    errors.confirmPass = 'Password and confirmation must match'
  }
  return {
    errors,
    isValid: isEmpty(errors)
  }
}
