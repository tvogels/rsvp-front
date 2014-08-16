
function getSrv(name) {
  return angular.element(document.body).injector().get(name);
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function inArray(needle, haystack) {
    var length = haystack.length;
    for(var i = 0; i < length; i++) {
        if(haystack[i] == needle) return true;
    }
    return false;
}

function isDefined(vb) {
  return (typeof vb !== 'undefined');
}