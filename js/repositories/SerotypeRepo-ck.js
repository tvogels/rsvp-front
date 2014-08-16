app.factory('SerotypeRepo', function ($http) {

  return {

    'serotypes': [],

    'load': function () {
      var self = this;
      return $http
        .get('/serotypes')
        .then(this.transformer)
        .then(function (serotypes) {
          self.serotypes = serotypes;
          return serotypes;
        });
    },

    'transformer': function () {
      function (res) {
        return res.data.map(function (a) {
          return a.label;
        });
      }
    }

  };

});
