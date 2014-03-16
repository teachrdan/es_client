if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require,exports,module) {

var Sheet = require('es_client/models/sheet');
var SheetCollection = require('es_client/models/sheet_collection');
var SelectionCollection = require('es_client/models/selection_collection');
var UserCollection = require('es_client/models/user_collection');
var User = require('es_client/models/user');

var initializeExpressionHelpers = require('es_client/lib/expression_helpers');
var config = require('es_client/config');

var createData = exports.createData = function(o,cb){
  var data = {};
  var expressionHelpers = initializeExpressionHelpers(data);
  var share_db = data._share_db = o.share_db;

// create sheet collection
  sheets_context = share_db.createContextAt('sheets');

  data.sheets = new SheetCollection([],{
    share_db: sheets_context,
    expressionHelpers: expressionHelpers
  });

  data.sheets.initializeShareDB();

// create users collection
  data.users = new UserCollection([],{selection_collection:data.selections});

  var new_user = new User();
  data.users.createCurrentUser(new_user);
  data.users
    .getCurrentUser()
    .setCurrentSheetId(data.sheets.first().id);

// create selection collection
  data.selections = new SelectionCollection([],{sheet_collection:data.sheets});

  data.selections.createLocal({
    user_id:data.users.getCurrentUser().id,
    color:config.DEFAULT_LOCAL_SELECTION_COLOR
  });

  cb(null,data);
};

var destroyData = module.exports.destroyData = function(data,cb){
  data._share_db.destroy();
  cb(null);
};

});