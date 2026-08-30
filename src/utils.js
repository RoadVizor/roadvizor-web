function isUndefined(value) {
  return value === undefined;
}

function isNull(value) {
  return value === null;
}

function isInvalid(value) {
  return isUndefined(value) || isNull(value);
}

function isEmailValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isPasswordValid(password) {
  return /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,12}$/.test(
    password,
  );
}

module.exports = {
  isUndefined,
  isNull,
  isInvalid,
  isEmailValid,
  isPasswordValid,
};
