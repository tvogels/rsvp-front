app.factory('ReferenceSetRepo', function ($http, ReferenceSet) {

  return {
    findAll: function () {
      return $http
        .get('/reference-sets')
        .then(ReferenceSet.apiResponseTransformer);
    }
  };

});
