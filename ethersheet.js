if (typeof define !== 'function') { var define = require('amdefine')(module) }
define( function(require,exports,module) {

var $ = require('jquery');

var config = require('./config');
var Socket = require('./lib/socket');
var Command = require('es_command');
var UndoQ = require('./lib/undo');

// models
var UserCollection = require('./models/user_collection');
var SheetCollection = require('./models/sheet_collection');
var SelectionCollection = require('./models/selection_collection');

// views
var TableView = require('./views/table');
var ExpressionEditorView = require('./views/expression_editor');
var EthersheetContainerView = require('./views/ethersheet_container');
var MenuView = require('./views/menu');

// inputs
var keyboardEvents = require('./views/keyboard');

var Ethersheet = module.exports = function(o) {
  if(!o.target) throw Error('el or target required');
 
  this.connection_handler = function(){};
  this.data = {};
  this.socket = null;
  this.undoQ = new UndoQ();
  this.keyboard = keyboardEvents();

  this.initializeData(o);
  this.initializeSocket(o);
  this.initializeDisplay(o);
  this.initializeCommands(o);
};

Ethersheet.prototype.initializeData = function(o){
  this.data.sheet = new SheetCollection([o.sheet]);
  this.data.selection = new SelectionCollection([],{sheet_collection: this.data.sheet});
  this.data.user = new UserCollection([],{selection_collection:this.data.selection});
  this.data.user.createCurrentUser(o.user);
  this.data.selection.createLocal({
    user_id:this.data.user.getCurrentUser().id,
    color:config.DEFAULT_LOCAL_SELECTION_COLOR
  });
};

Ethersheet.prototype.initializeSocket = function(o){
  var es = this;
  
  this.socket = new Socket(o.channel,this.data.user.getCurrentUser().id,o.socket);

  this.socket.onOpen(function(e){
    es.data.user.replicateCurrentUser();
    es.data.user.requestReplicateCurrentUser();
    es.data.selection.replicateLocalSelection();
    es.data.selection.requestReplicateLocalSelection();
    es.connect();
  });

  this.socket.onMessage(function(e){
    var data_string = e.data;
    var c = new Command(data_string);
    es.executeCommand(c);
  });

  this.bindDataToSocket();
};

Ethersheet.prototype.initializeDisplay = function(o){
  var es = this;
  $(function(){
    es.$el = $(o.target);
    es.ethersheet_container = new EthersheetContainerView({
      el: es.$el
    }).render();
    es.expression_editor = new ExpressionEditorView({
      el: $('#es-expression-editor-container', es.$el),
      sheet: es.data.sheet.first(),
      selections: es.data.selection.getLocal(),
    }).render();
    es.table = new TableView({
      el: $('#es-table-container', es.$el),
      sheet: es.data.sheet.first(),
      selections: es.data.selection,
      local_selection: es.data.selection.getLocal()
    }).render();
    es.menu = new MenuView({
      el: $('#es-menu-container', es.$el),
      sheet: es.data.sheet.first(),
      selections: es.data.selection
    }).render();
  });
};

Ethersheet.prototype.onConnect = function(handler){
  this.connection_handler = handler;
};

Ethersheet.prototype.connect = function(){
  this.connection_handler();
};

Ethersheet.prototype.initializeCommands = function(o){
  var es = this;
  this.keyboard.on('meta_90',this.undoCommand.bind(this));
  this.keyboard.on('meta_88',this.redoCommand.bind(this));

};

Ethersheet.prototype.executeCommand = function(c){
  var model = this.getModel(c.getDataType(),c.getDataId());
  model.disableSend();
  c.execute(model);
  model.enableSend();
};

Ethersheet.prototype.undoCommand = function(){
  var msg = this.undoQ.undo();
  console.log('undo',msg);
  if(!msg) return;
  var c = new Command(msg);
  this.executeCommand(c);
};

Ethersheet.prototype.redoCommand = function(){
  var msg = this.undoQ.do();
  console.log('redo',msg);
  if(!msg) return;
  var c = new Command(msg);
  this.executeCommand(c);
};

Ethersheet.prototype.getModel = function(type,id){
  var collection = this.data[type];
  if(!collection) return false;
  if(!id) return collection;
  return collection.get(id);
};

Ethersheet.prototype.bindDataToSocket = function(){
  var es = this;
  for(var type in this.data){
    this.data[type].on('send',function(do_cmd,undo_cmd){
      if(do_cmd.getSerializedMessage){
        es.socket.send(do_cmd.getSerializedMessage());
      } else {
        es.socket.send(Command.serialize(do_cmd));
      }
      if(undo_cmd){
        console.log('command',do_cmd,undo_cmd);
        es.undoQ.push(do_cmd,undo_cmd);
      }
    });
  }
};

});
