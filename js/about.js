// Copyright 2012 Google Inc.  All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License.  You may obtain a copy
// of the License at: http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software distrib-
// uted under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES
// OR CONDITIONS OF ANY KIND, either express or implied.  See the License for
// specific language governing permissions and limitations under the License.

/**
 * @fileoverview A popup which displays over the map to tell more about the map.
 */

goog.provide('cm.AboutPopup');

goog.require('cm');
goog.require('cm.ui');
goog.require('goog.dom');
goog.require('goog.dom.TagName');

/**
 * A graphical element that displays information about the map.
 * @param {Element} container The element over which to render the about box.
 * @param {Element=} opt_aboutContainer The optional container for the about
 *   box.
 * @constructor
 */
cm.AboutPopup = function(container, opt_aboutContainer) {

  var aboutBox = cm.AboutPopup.populate_(opt_aboutContainer);

  if (aboutBox) {
    this.container_ = container;

    this.popup_ = cm.ui.create(
        goog.dom.TagName.DIV, {'id': 'cm-about', 'class': 'cm-popup'},
        aboutBox);

    // Creates a close button for the about popup.
    cm.ui.createCloseButton(this.popup_, goog.bind(function() {
      this.popup_.parentNode.removeChild(this.popup_);
    }, this));
  }

};

/**
 * Shows the About this map popup.
 */
cm.AboutPopup.prototype.show = function() {
  var size = cm.ui.offscreenSize(this.popup_, this.container_);
  var x = Math.max(0, (this.container_.offsetWidth - size.width) / 2);
  var y = Math.max(0, (this.container_.offsetHeight - size.height) / 2);
  this.popup_.style.left = Math.round(x) + 'px';
  this.popup_.style.top = Math.round(y) + 'px';
  cm.ui.document.body.appendChild(this.popup_);
};

/**
 * Populate the about popup.
 * @param {Element=} opt_aboutContainer The optional container for the about
 *   box.
 * @return {Element} The new about box, populated.
 * @private
 */
cm.AboutPopup.populate_ = function(opt_aboutContainer) {
  var aboutBox = opt_aboutContainer || cm.ui.get('cm-aboutText');
  if (aboutBox) {
    var header = cm.ui.create(
        goog.dom.TagName.H2, {'id': 'cm-about-header'});
    header.appendChild(
        goog.dom.htmlToDocumentFragment(cm.AboutPopup.MSG_ABOUT_HEADER_));
    aboutBox.appendChild(header);
    var text = cm.ui.create(
        goog.dom.TagName.P, {
          'id': 'cm-about-text',
          'class': 'cm-about-text'
        });
    text.appendChild(
        goog.dom.htmlToDocumentFragment(cm.AboutPopup.MSG_ABOUT_HTML_));
    aboutBox.appendChild(text);
    aboutBox.style.display = 'block';
  }
  return aboutBox;
};

/**
 * @desc Header for the about box.
 * @private
 */
cm.AboutPopup.MSG_ABOUT_HEADER_ = goog.getMsg('Google Crisis Map');

/**
 * TODO(kpy): Make this easier to customize for non-Google deployments.
 * @desc Introductory paragraph in the about box.
 * @private
 */
cm.AboutPopup.MSG_ABOUT_HTML_ = goog.getMsg(
    '<p>This map displays information about current crises and events ' +
    'for which the ' +
    '<a href="http://www.google.org/crisisresponse" target="_blank">Google ' +
    'Crisis Response team</a> has collected geographic information. ' +
    'The data comes from a variety of sources, including official ' +
    'information sources and user-generated content.  See the Layers list ' +
    'for additional details about each layer.</p>' +
    'Tips for using this site:' +
    '<ul>' +
    '  <li>Zoom the map using either the on-screen controls or your mouse.' +
    '  </li>' +
    '  <li>Find additional layers in the Layers list, where you can turn' +
    '  them on or off.  Scroll to see all layers.</li>' +
    '  <li>Zoom to an appropriate view for each layer by clicking the "Zoom' +
    '  to area" links in the Layers list.</li>' +
    '  <li>View selected layers in <a href="http://www.google.com/earth/"' +
    '  target="_blank">Google Earth</a> by clicking the "Download KML" links' +
    '  in the Layers list.</li>' +
    '  <li>Share the map in e-mail by clicking the Share button and copying' +
    '  the URL provided there. The URL will restore your current view,' +
    '  including the set of layers that you have turned on.</li>' +
    '  <li>Embed the map on your website or blog by getting a snippet of ' +
    '  HTML code from the Share button.</li>' +
    '  <li>Share the link on Google+, Twitter or Facebook by clicking the ' +
    '  appropriate button in the Share window.</li>' +
    '</ul>' +
    '<p>If you wish to provide feedback or comments on the map, or if you ' +
    'are aware of map layers or other datasets that you would like to ' +
    'see included on our maps, please submit them for our evaluation ' +
    'using <a href="http://goo.gl/MCJLS" target="_blank">this form</a>.</p>');
