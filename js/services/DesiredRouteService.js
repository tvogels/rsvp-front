app.service('DesiredRoute', function (USER_ROLES, $state) {
  this.route = null;
  this.setRoute = function (route) {
    this.route = route;
  };

  this.go = function () {
    if (!!this.route) {
      $state.go(this.route.name);
      this.route = null;
    }
  };
  return this;
});
