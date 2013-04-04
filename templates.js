if (typeof define !== 'function') { var define = require('amdefine')(module) }
define( function(require,exports,module){

var _ = require('underscore');
var helpers = require('es_client/helpers');
module.exports = module.exports || {};
module.exports['table_col_headers'] = _.template("<% var h = require('es_client/helpers'); %>\n<tr>\n  <% for(var i=0; i<num_col; i++){ %>\n    <th class=\"es-column-header\"><%= h.columnIndexToName(i) %></th>\n  <% } %>\n</tr>\n");
module.exports['sheet_table'] = _.template("<div id=\"es-table-<%= id %>\" class=\"es-table-view\">\n  <table id=\"es-column-headers-<%=id%>\" class=\"es-column-headers es-table\">\n    <thead></thead>\n    <tbody></tbody>\n  </table>\n  <table id=\"es-row-headers-<%=id%>\" class=\"es-row-headers es-table\">\n    <thead></thead>\n    <tbody></tbody>\n  </table>\n  <div id=\"es-grid-container-<%= id %>\" class=\"es-grid-container\">\n    <table id=\"es-grid-<%= id %>\" class=\"es-grid es-table\">\n      <thead></thead>\n      <tbody id=\"es-data-table-<%=id%>\"></tbody>\n    </table>\n  </div>\n  <div class=\"es-table-corner\"></div>\n</div>\n");
module.exports['table'] = _.template("<% var _ = require('underscore'); %>\n<% _.each(sheet.rowIds(), function(row_id){ %>\n  <tr id=\"<%= row_id %>\" class=\"es-table-row\" data-row_id=\"<%= row_id %>\">\n    <% _.each(sheet.colIds(), function(col_id){ %>\n      <td id=\"<%= row_id %>-<%= col_id %>\" class=\"es-table-cell\" style=\"background-color: <%= sheet.getColor(row_id, col_id) %>\" data-row_id=\"<%= row_id %>\" data-col_id=\"<%= col_id %>\" data-value=\"<%= sheet.getCellValue(row_id,col_id)%>\"><%= sheet.getDisplayValue(row_id,col_id) %></td>\n    <% }) %>\n  </tr>\n<% }) %>\n");
module.exports['menu'] = _.template("<ul id=\"es-menu-list\">\n  <li>\n    <a  id=\"es-menu-add-column\" \n        class=\"es-menu-button\" \n        data-action=\"add_column\"><b>+</b> Add Column</a>\n  </li><li>\n    <a  id=\"es-menu-remove-column\" \n        class=\"es-menu-button\" \n        data-action=\"remove_column\"><b>-</b> Remove Column</a>\n  </li><li>\n    <a  id=\"es-menu-add-row\" \n        class=\"es-menu-button\" \n        data-action=\"add_row\"><b>+</b> Add Row</a>\n  </li><li>\n    <a  id=\"es-menu-remove-column\" \n        class=\"es-menu-button\" \n        data-action=\"remove_row\"><b>-</b> Remove Row</a>\n  </li>\n</ul>\n<div class='clear'></div>\n");
module.exports['es_container'] = _.template("<div id=\"es-container\">\n  <div id=\"es-expression-editor-container\"></div>\n  <div id=\"es-menu-container\"></div>\n  <div id=\"es-table-container\"></div>\n  <div id=\"es-modal-overlay\"><div id=\"es-modal-box\"></div></div>\n</div>\n");
module.exports['expression_editor'] = _.template("<a id='expression-wizard'>&#402;(x)</a><div class=\"ExpressionEditor\"><input type='text' length='100'>\n");
var templateWrapper = function(template){
  return function(data){
    data = data || {};
    data.require = require;
    return template(data);
  }
};
for(i in module.exports) module.exports[i] = templateWrapper(module.exports[i]);

});
