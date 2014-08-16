app.factory('FrequencySetRepo', function ($http, FrequencySet) {

  return {
    findAll: function () {
      return $http
        .get('/frequency-sets')
        .then(FrequencySet.apiResponseTransformer);
    }
  };

});
