
app.directive('excelInput', function (Excel) {

  /*
   * Checks if a row has missing values
   */
  function hasNoMissings(variables, row) {
    for (var i = variables.length - 1; i >= 0; i--) {
      var st = variables[i];
      if (!isNumeric(row[st])) {
        return false;
      }
    }
    return true;
  }

  /*
   * Handler for drag hover
   */
  function fileDragHover(dropElem, e) {
    e.stopPropagation();
    e.preventDefault();
    dropElem.className = (e.type === "dragover" ? "hover dropzone" : "dropzone");
  }

  /*
   * Handler for file selection
   * needs scope because it runs ParseFile(scope, file)
   */
  function fileSelectHandler(scope, dropElem, e) {
    fileDragHover(dropElem, e);
    var files = dropElem.files || e.dataTransfer.files;
    parseFile(scope, files[0]);
  }

  /*
   * Handle Excel data produced by parseFile
   */
  function handleSheet(scope, file, sheet) {

    if (scope.requireId === 'true' && !sheet[0].hasOwnProperty('id')) {
      alert('Please make sure that the dataset includes a column named "id".');
      return false;
    }

    scope.filename = file.name;
    scope.excelData = sheet;

    renameVariablesAndAssignToScope(scope);
    checkMissings(scope);

  }

  /*
   * Rename variables and assign them to the scope
   */
  function renameVariablesAndAssignToScope(scope) {
      var prop;

      scope.excelVariables = [];
      for (prop in scope.excelData[0]) {
        var slimprop = prop.replace(/^\D+/g,'').toLowerCase();
        if (scope.excelData[0].hasOwnProperty(prop) && scope.serotypes.indexOf(slimprop) !== -1) {
          if (slimprop !== prop) {
            // change it
            for (var i = 0; i < scope.excelData.length; i++) {
              scope.excelData[i][slimprop] = scope.excelData[i][prop];
              delete scope.excelData[i][prop];
            }
          }
          scope.excelVariables.push(slimprop);
        } else if (slimprop != 'id') {
          for (var i = 0; i < scope.excelData.length; i++) {
            delete scope.excelData[i][prop];
          }
        }
      }
  }

  /*
   * Check for missings
   */
  function checkMissings(scope) {
    var origCount = scope.excelData.length;
    scope.excelData = scope.excelData.filter(hasNoMissings.bind(null, scope.excelVariables));
    var afterCount = scope.excelData.length;
    var diff = origCount - afterCount;
    if (diff !== 0) {
      alert(diff + ' rows contain missing/non-numeric values and have been omitted.');
      return false;
    }
  }

  /*
   * Parse a file (argument 2) and attach it's contents to the scope
   */
  function parseFile(scope, file) {
    Excel
      .readFirstSheetFromFile(file)
      .then(handleSheet.bind(null, scope, file));
  }


  return {

    'scope': {
      'excelData': '=',
      'excelVariables': '=',
      'requireId': '@'
    },

    'templateUrl': '/js/views/excel-input.html',

    'link': function (scope, element) {
      var dropElem = element[0];
      scope.filename = null;
      dropElem.className = 'dropzone';
      dropElem.addEventListener("dragover", fileDragHover.bind(null, dropElem), false);
      dropElem.addEventListener("dragleave", fileDragHover.bind(null, dropElem), false);
      dropElem.addEventListener("drop", fileSelectHandler.bind(null, scope, dropElem), false);
    },

    'controller': function ($scope, SerotypeRepo) {
      // make sure a list of all available serotypes is accessible
      $scope.serotypes = SerotypeRepo.serotypes;
      // watch excelVariables to reset the file name if necessary
      $scope.$watch('excelVariables', function (dta) {
        if (!dta || dta.length === 0) {
          $scope.filename = null;
        }
      });
    }

  };
});
