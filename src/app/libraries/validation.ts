var validateEmail = (email) => {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

var validateUsername = (value) => {
  return value.replace(/ /g, "").length >= 5
}

var validatePhone = (value) => {
  return /^[0-9][0-9]{9,10}$/.test(value);
}

var validatePassword = (value) => {
  var re = /^(?=[a-zA-Z0-9!@#$%&*_?]{8,}$)(?=.*?[!@#$%&*_?])(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[0-9]).*/;
  return re.test(value)
}
var validateWebsite = (value) => {
  var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
  return pattern.test(value);
}

var validateDealValue = (value) => {
  //let val = parseInt(value);
  return /^([0-9]{1,4}[.]?[0-9]{0,2})/.test(value);
}

var comparePassword = (a, b) => {
  return a.toLowerCase().replace(/ /g, "") === b.toLowerCase().replace(/ /g, "")
}

var validateWinBidValue = (value) => {
  return /^([0-9]{1,4}[.]?[0-9]{0,2})/.test(value);
}

export { validateEmail, validateUsername, validatePassword, validatePhone, comparePassword, validateWebsite, validateDealValue, validateWinBidValue };
