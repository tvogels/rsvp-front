app.factory('FrequencySet', function () {

  function FrequencySet(id, label, public, user, frequencies, hasSerotypes) {
    this.id = id;
    this.label = label;
    this.public = public;
    this.user = user;
    this.frequencies = frequencies;
    this.hasSerotypes = hasSerotypes;
  }

  FrequencySet.build = function (data) {
    return new FrequencySet(
      data.id,
      data.label,
      data.public,
      data.user,
      data.frequencies,
      data.hasSerotypes
    );
  };

  FrequencySet.apiResponseTransformer = function (response) {
    return response.data.map(FrequencySet.build);
  };

  return FrequencySet;

});
