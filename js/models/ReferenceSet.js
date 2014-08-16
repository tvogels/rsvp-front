app.factory('ReferenceSet', function ($q, $timeout) {

  function ReferenceSet() {
    this.id = null;
    this.label = null;
    this.user = null;
    this.public = null;
    this.hasSerotypes = [];
    this.statistics = {};
    this.data = undefined;
  }

  ReferenceSet.prototype.hasData = function () {
    return (typeof this.data !== 'undefined');
  };

  ReferenceSet.prototype.computeStatistics = function () {
    var deferred = $q.defer();
    this.statistics = {
      'mean': {}, 
      'med': {}, 
      'std': {}, 
      'var': {}, 
      'p5': {}, 
      'p95': {}
    };
    var self = this;
    $timeout(function () {
      for (var i = self.hasSerotypes.length - 1; i >= 0; i--) {
        var st = self.hasSerotypes[i];
        // loop through serotypes
        // construct a vector of results
        var vector = new gauss.Vector;
        for (var j = self.data.length - 1; j >= 0; j--) {
          var row = self.data[j];
          vector.push(parseFloat(row[st]));
        }
        self.statistics.mean[st] = vector.mean();
        self.statistics.std[st] = vector.stdev();
        self.statistics.med[st] = vector.median();
        self.statistics['var'][st] = vector.variance();
        self.statistics.p5[st] = vector.percentile(.05);
        self.statistics.p95[st] = vector.percentile(.95);
      }
      deferred.resolve(self);
    }, 0);

    return deferred.promise;
  }

  ReferenceSet.build = function (data) {
    var rs = new ReferenceSet();
    rs.id = data.id;
    rs.label = data.label;
    rs.user = data.user;
    rs.public = data.public;
    rs.hasSerotypes = data.hasSerotypes;
    rs.statistics = data.statistics;
    rs.data = data.data;
    return rs;
  };

  ReferenceSet.apiResponseTransformer = function (response) {
    return response.data.map(ReferenceSet.build);
  };

  return ReferenceSet;

});
