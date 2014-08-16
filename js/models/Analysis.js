app.factory('Analysis', function () {

  function Analysis() {
    this.reset();
  }

  Analysis.prototype.frequenciesValid = function () {

    for (var i = this.hasSerotypes.length - 1; i >= 0; i--) {
      var st = this.hasSerotypes[i];
      if (!isNumeric(this.frequencies[st])) {
        return false;
      }
    }

    if (this.hasSerotypes.length === 0) {
      return false;
    }

    return true;
  };

  /*
   * This is a stub
   * Better validation should follow
   */
  Analysis.prototype.dataValid = function () {
    return this.hasSerotypes.length > 0;
  }

  Analysis.prototype.useFrequencyPreset = function (set) {
    for (var i = set.hasSerotypes.length - 1; i >= 0; i--) {
      var st = set.hasSerotypes[i];
      if (this.hasSerotypes.indexOf(st) !== -1) {
        this.frequencies[st] = set.frequencies[st];
      }
    }
  };

  Analysis.prototype.reset = function () {
    this.id = null;
    this.user = null;
    this.label = null;
    this.referenceStatistics = {};
    this.frequencies = {};
    this.data = [];
    this.hasSerotypes = [];
  }

  Analysis.build = function (data) {
    var a = new Analysis;
    a.id = data.id;
    return a;
  };

  Analysis.apiResponseTransformer = function (response) {
    return response.data.map(Analysis.build);
  };

  return Analysis;

});
