
app.directive('excelInput', function () {
  return {
    'scope': {
      'excelData': '=',
      'excelVariables': '=',
      'serotypes': '=',
      'requireId': '@'
    },
    'template': "<p ng-if='filename == null'>Drag and drop an Excel file (.xls) here.</p>" +
                "<p ng-if='filename != null'>Imported {{filename}} ({{excelData.length}} rows).</p>" +
                "Serotypes: <ul ng-if='filename != null' class='list-inline'><li ng-repeat='var in excelVariables'>{{var}}</li></ul>",
    'link': function (scope, element) {
      element[0].className = 'dropzone';
      function FileDragHover(e) {
        e.stopPropagation();
        e.preventDefault();
        element[0].className = (e.type == "dragover" ? "hover dropzone" : "dropzone");
      }

      function FileSelectHandler(e) {

        // cancel event and hover styling
        FileDragHover(e);

        // fetch FileList object
        var files = element[0].files || e.dataTransfer.files;

        // process all File objects
        ParseFile(files[0]);

      }

      function ParseFile(file) {

        console.log(
          "File information", file.name,
          "type:" , file.type ,
          "size:" , file.size ,
          "bytes"
        );
        scope.filename = file.name;
        var reader = new FileReader();
        var name = file.name;

        function hasNoMissings(row) {
          for (var i = scope.excelVariables.length - 1; i >= 0; i--) {
            var st = scope.excelVariables[i];
            if (!isNumeric(row[st])) {
              return false;
            }
          };
          return true;
        }

        reader.onload = function(e) {
          var data = e.target.result;

          /* if binary string, read with type 'binary' */
          var wb = XLS.read(data, {type: 'binary'});

          var tmp = XLS.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

          if (scope.requireId === 'true' && !tmp[0].hasOwnProperty('id')) {
            alert('Please make sure that the dataset includes a column named "id".');
            return false;
          }

          scope.excelData = tmp;
          scope.excelVariables = [];
          var prop;


          for (prop in scope.excelData[0]) {
              var slimprop = prop.replace(/^\D+/g,'').toLowerCase();
              if (scope.excelData[0].hasOwnProperty(prop) && scope.serotypes.indexOf(slimprop) != -1) {
                  if (slimprop != prop) {
                    // change it
                    for (i = 0; i < scope.excelData.length; i++) { 
                        scope.excelData[i][slimprop] = scope.excelData[i][prop];
                        delete scope.excelData[i][prop];
                    }
                  }
                  scope.excelVariables.push(slimprop);
              }
          }

          // get rid of missings / non numerics
          var origCount = scope.excelData.length;
          console.log(scope.excelData);
          scope.excelData = scope.excelData.filter(hasNoMissings);
          var afterCount = scope.excelData.length;
          var diff = origCount - afterCount;
          if (diff !== 0) {
            alert(diff + ' rows contain missing/non-numeric values and have been omitted.');
          }

          scope.$apply();
        };
        reader.readAsBinaryString(file);
        
      }

      element[0].addEventListener("dragover", FileDragHover, false);
      element[0].addEventListener("dragleave", FileDragHover, false);
      element[0].addEventListener("drop", FileSelectHandler, false);

    },
    'controller': function ($scope) {
      $scope.$watch('excelVariables', function (dta) {
        if (!dta || dta.length === 0) {
          $scope.filename = null;
        }
      });
    }
  };
});
