app.filter('sufficientSerotypes', function () {
  return function (referenceSets, minimumSerotypes) {
    return referenceSets.filter(function (referenceSet) {
      var filtered = minimumSerotypes.filter(function (n) {
        return referenceSet.hasSerotypes.indexOf(n) === -1;
      });
      return filtered.length === 0;
    });
  };
});