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

// Author: romano@google.com (Raquel Romano)

function DeleteLayerCommandTest() {
  this.mapModel_ = cm.MapModel.newFromMapRoot(
      {layers: [{id: 'layer0', type: 'KML'},
                {id: 'layer1', type: 'FOLDER', sublayers: [
                   {id: 'sub0', type: 'GOOGLE_FUSION_TABLES'},
                   {id: 'sub1', type: 'GOOGLE_TRAFFIC'},
                   {id: 'sub2', type: 'GOOGLE_MAP_DATA'}
                 ]},
                {id: 'layer2', type: 'GEORSS'}]});
  this.appState_ = new cm.AppState();
  this.appState_.setLayerEnabled('layer1', true);
  this.appState_.setLayerEnabled('sub2', true);
}
registerTestSuite(DeleteLayerCommandTest);

/** Tests execute() on a 'root-level' layer. */
DeleteLayerCommandTest.prototype.testExecuteRoot = function() {
  var command = new cm.DeleteLayerCommand('layer1');
  command.execute(this.appState_, this.mapModel_);
  expectThat(this.mapModel_.getLayerIds(),
            whenSorted(elementsAre(['layer0', 'layer2'])));
  expectTrue(this.appState_.get('enabled_layer_ids').isEmpty());
};

/** Tests undo() on a 'root-level' layer. */
DeleteLayerCommandTest.prototype.testUndoRoot = function() {
  var command = new cm.DeleteLayerCommand('layer1');
  command.execute(this.appState_, this.mapModel_);
  command.undo(this.appState_, this.mapModel_);
  expectThat(this.mapModel_.getLayerIds(),
            whenSorted(elementsAre(['layer0', 'layer1', 'layer2'])));
  expectThat(this.mapModel_.getLayer('layer1').getSublayerIds(),
             whenSorted(elementsAre(['sub0', 'sub1', 'sub2'])));
  expectThat(this.appState_.get('enabled_layer_ids').getValues(),
             whenSorted(elementsAre(['layer1', 'sub2'])));
};

/** Tests execute() on a sublayer. */
DeleteLayerCommandTest.prototype.testExecuteSublayer = function() {
  var command = new cm.DeleteLayerCommand('sub2');
  command.execute(this.appState_, this.mapModel_);
  expectThat(this.mapModel_.getLayer('sub2'), isUndefined);
  expectFalse(this.appState_.getLayerEnabled('sub2'));
};

/** Tests execute() on a sublayer. */
DeleteLayerCommandTest.prototype.testUndoSublayer = function() {
  var command = new cm.DeleteLayerCommand('sub2');
  command.execute(this.appState_, this.mapModel_);
  command.undo(this.appState_, this.mapModel_);
  expectThat(this.mapModel_.getLayer('sub2'), not(isUndefined));
  expectTrue(this.appState_.getLayerEnabled('sub2'));
};
