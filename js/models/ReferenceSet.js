app.factory('ReferenceSet', function () {

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
