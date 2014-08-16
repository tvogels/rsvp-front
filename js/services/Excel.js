app.factory('Excel', function ($q) {

  return {

    /*
     * Read a workbook (return a promise)
     */
    readWorkbookFromFile: function (file) {
      var deferred = $q.defer();

      var reader = new FileReader();
      reader.readAsBinaryString(file);
      reader.onload = function(e) {
        var data = e.target.result;
        deferred.resolve(XLS.read(data, {type: 'binary'}));
      };

      return deferred.promise;
    },

    /*
     * Read the first sheet (return a promise)
     */
    readFirstSheetFromFile: function (file) {
      return this.readWorkbookFromFile(file).then(function (wb) {
        return XLS.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
      });
    }

  };

});
