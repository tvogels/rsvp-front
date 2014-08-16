app.directive('singlePatientInput', function () {

  return {

    'scope': {
      'data': '=',
      'variables': '='
    },

    'templateUrl': "/js/views/single-patient-input.html",

    'link': function (scope) {

      // set up a data array with one element, the 'patient'
      scope.patient = function () {
        if (scope.data.length == 0) {
          var pat = {};
          scope.data.push(pat);
          return pat;
        } else {
          return scope.data[0];
        }
      }
    },

    'controller': function ($scope, SerotypeRepo) {

      $scope.serotypes = SerotypeRepo.serotypes;

      /*
       * Save the form
       */
      $scope.createNew = function (formdata) {

        // check if we don't have the serotype already
        if (inArray(formdata.serotype, $scope.variables)) {
          return alert('You already entered serotype '+formdata.serotype+'.');
        }

        // force chosing a serotype
        if (!isDefined(formdata.serotype) || formdata.serotype === null) {
          return alert('Please choose a serotype');
        }

        // parse the response and add it to the right places
        formdata.response = parseFloat(formdata.response);
        $scope.variables.push(formdata.serotype);
        $scope.patient()[formdata.serotype] = formdata.response;

        // reset the form
        $scope.formdata = {'serotype': null, 'response': ''};
        $scope.form.$setPristine();
        document.getElementById('select-serotype').focus();
      };

      /*
       * Remove a serotype
       */
      $scope.removeSerotype = function (st) {
        var array = $scope.variables;
        var index = array.indexOf(st);
        if (index > -1) {
          array.splice(index, 1);
          delete $scope.data[st];
        }
      };
      
    }

  };

});
