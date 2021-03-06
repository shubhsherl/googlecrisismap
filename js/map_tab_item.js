// Copyright 2013 Google Inc.  All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License.  You may obtain a copy
// of the License at: http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software distrib-
// uted under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES
// OR CONDITIONS OF ANY KIND, either express or implied.  See the License for
// specific language governing permissions and limitations under the License.

goog.provide('cm.MapTabItem');

goog.require('cm.MapPicker');
goog.require('cm.TabItem');
goog.require('goog.dom.classes');


/**
 * Superclass for tabs in the tab panel that require a map model.
 * Subclasses must define getTitle and getIcon.  If they can be disabled,
 * they should override getIsEnabled.
 * @param {!cm.MapModel} mapModel The model of the map being rendered
 * @param {!cm.AppState} appState The application state model.
 * @param {Object} config Configuration options, largely for editing
 * @implements cm.TabItem
 * @constructor
 */
cm.MapTabItem = function(mapModel, appState, config) {
  /** @protected {!cm.MapModel} */
  this.mapModel = mapModel;

  /** @protected {!cm.AppState} */
  this.appState = appState;

  /** @protected {Object} */
  this.config = config || {};

  /** @protected {cm.TabView} */
  this.tabView = null;

  /** @private {!Element} */
  this.content_ = cm.ui.create('div', {'class': cm.css.INNER_TAB_CONTENT});

  /** @type {boolean} */
  this.isSelected = false;

  /** @type {boolean} */
  this.editingEnabled = this.config['enable_editing'];

  /**
   * Flag that suppresses render_ from being called more than once by
   * different event handlers.
   * @private {boolean}
   */
  this.renderBegun_ = false;

  /**
   * Flag that suppresses promptRelayout from being called before
   * rendering is complete.
   * @private {boolean}
   */
  this.renderEnded_ = false;

  /** @private Element */
  this.mapTitleElem_;
};

/**
 * Renders the header and contents of the tab item in to this.content_.
 * @private
 */
cm.MapTabItem.prototype.render_ = function() {
  if (this.renderBegun_) return;
  this.renderBegun_ = true;

  var headerElem = cm.ui.create('div', {'class': cm.css.PANEL_HEADER});
  this.addHeader(headerElem);
  cm.ui.append(this.content_, headerElem);
  this.addContent(this.content_);
  this.renderEnded_ = true;
};

/**
 * Called during rendering to fill the header, which is located at the very top
 * of the scrolling region of the tab.
 * By default, this area contains map title and publisher. Subclasses may
 * override to fill headerElem with different content.
 * @param {Element} headerElem The node into which header content should be
 *   placed.
 */
cm.MapTabItem.prototype.addHeader = function(headerElem) {
  if (this.config['hide_panel_header']) {
    // Hide the element so it doesn't take up any space.
    headerElem.style.display = 'none';
  } else {
    if (this.config['draft_mode']) {
      cm.ui.append(headerElem, cm.ui.create(
          'span',
          {'class': cm.css.DRAFT_INDICATOR, 'title': cm.MSG_DRAFT_TOOLTIP},
          cm.MSG_DRAFT_LABEL));
    }

    cm.ui.append(headerElem, this.createMapTitle_());
    this.enableMapPicker_();

    var publisher = this.config['publisher_name'];
    if (publisher) {
      var publisherElem = cm.ui.create('div', {'class': cm.css.MAP_PUBLISHER});
      new cm.Html(
          cm.getMsgPublisherAttribution(publisher)).pasteInto(publisherElem);
      cm.ui.append(headerElem, publisherElem);
    }
  }
};

/**
 * Called during rendering to fill the scrolling region of the tab.  Subclasses
 * should override to fill parentElem with whatever content they want to appear
 * in the scrolling section of the tab.
 * @param {Element} parentElem The node into which content should be placed.
 */
cm.MapTabItem.prototype.addContent = function(parentElem) {};

/**
 * Cause the containing tab view to relayout following a change in size of
 * the tab.  Not entirely clear how this should be used; placeholder so that
 * the correct messaging from the tab items up to the view is in place, but we
 * may want a separate message from updateTabItem(), which is used to notify of
 * changes to any aspect of the tab (title, icon, dis/enabled status, etc.)
 */
cm.MapTabItem.prototype.promptRelayout = function() {
  if (this.renderEnded_ && this.isSelected) {
    this.tabView.updateTabItem(this);
  }
};

/** @override */
cm.MapTabItem.prototype.getTitle = function() {};

/** @override */
cm.MapTabItem.prototype.getIcon = function() {};

/** @override */
cm.MapTabItem.prototype.getContent = function() {
  this.render_();
  return this.content_;
};

/** @override */
cm.MapTabItem.prototype.getIsEnabled = function() { return true; };

/** @override */
cm.MapTabItem.prototype.setSelected = function(isSelected) {
  this.isSelected = isSelected;
};

/** @override */
cm.MapTabItem.prototype.setTabView = function(tabView) {
  this.tabView = tabView;
};

/**
 * Creates an element containing the map title for display in the header
 * of content pane when this.shouldDisplayMapTitle_ is true.
 * @return {Element} The title element.
 * @private
 */
cm.MapTabItem.prototype.createMapTitle_ = function() {
  this.mapTitleElem_ = cm.ui.create('h1', {'class': cm.css.MAP_TITLE});
  cm.events.onChange(this.mapModel, 'title', this.handleTitleChanged_, this);
  this.handleTitleChanged_();

  if (this.editingEnabled) {
    // Open the property inspector on the map.
    cm.events.forward(this.mapTitleElem_, 'click',
                      cm.app, cm.events.INSPECT, {object: this.mapModel});
  }
  return this.mapTitleElem_;
};

/**
 * Respond to a title change in the map model.
 * @private
 */
cm.MapTabItem.prototype.handleTitleChanged_ = function() {
  var title = /** @type string */(this.mapModel.get('title'));
  cm.ui.setText(this.mapTitleElem_, title);
  cm.ui.document.title = title;
  this.promptRelayout();
};

/**
 * Makes the title text a clickable target to bring up the map picker.
 * @private
 */
cm.MapTabItem.prototype.enableMapPicker_ = function() {
  var menuItems = this.config['map_picker_items'];
  if (!this.mapTitleElem_ || !menuItems || !menuItems.length ||
      this.config['draft_mode'] || this.config['enable_editing'] ||
      this.config['hide_panel_header']) {
    return;
  }

  goog.dom.classes.add(this.mapTitleElem_, cm.css.MAP_TITLE_PICKER);
  var picker = new cm.MapPicker(this.mapTitleElem_, menuItems);
  cm.events.listen(this.mapTitleElem_, 'click', goog.bind(function(e) {
    picker.showMenu(true);
    e.stopPropagation ? e.stopPropagation() : (e.cancelBubble = true);
  }, picker));
};

/** @override */
cm.MapTabItem.prototype.analyticsSelectionEvent = function() {
  return cm.Analytics.TabPanelAction.NEW_TAB_SELECTED;
};
