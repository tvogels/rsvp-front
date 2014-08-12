app.service('Session', function (USER_ROLES) {
  this.create = function (sessionId, userId, userRole) {
    this.id = sessionId;
    this.userId = userId;
    this.userRole = userRole;
  };
  this.destroy = function () {
    this.id = null;
    this.userId = null;
    this.userRole = USER_ROLES.guest;
  };
  this.destroy();
  return this;
});
