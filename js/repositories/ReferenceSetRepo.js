app.factory('ReferenceSetRepo', function ($http, ReferenceSet) {

  return {
    findAll: function () {
      return $http
        .get('/reference-sets?{"$sort":{"public": 1}}')
        .then(ReferenceSet.apiResponseTransformer);
    },
    save: function (set) {
      return $http
        .post('/reference-sets', set)
        .then(function (resp) { return ReferenceSet.build(resp.data); });
    }
  };

});
