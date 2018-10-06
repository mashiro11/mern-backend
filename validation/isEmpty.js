const isEmpty = value =>
// single explression javascript arrow function implicitly returns
// expression resulting value
    value === undefined ||
    value === null ||
    (typeof value === 'object' && Object.keys(value).length === 0) ||
    (typeof value === 'string' && value.trim().length === 0)

module.exports = isEmpty
