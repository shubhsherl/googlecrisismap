#!/usr/bin/python2.5
# Copyright 2012 Google Inc.  All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License"); you may not
# use this file except in compliance with the License.  You may obtain a copy
# of the License at: http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software distrib-
# uted under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES
# OR CONDITIONS OF ANY KIND, either express or implied.  See the License for
# specific language governing permissions and limitations under the License.

"""Tests for publish.py."""

__author__ = 'kpy@google.com (Ka-Ping Yee)'

import simplejson as json

# Allow relative imports within the app.  # pylint: disable=W0403
import base_handler
import model
import publish
import test_utils


class PublishTest(test_utils.BaseTest):
  """Tests for the publish.py request handler."""

  def setUp(self):
    super(PublishTest, self).setUp()
    test_utils.BecomeAdmin()
    self.map_object = model.Map.Create('{"title": "test map"}')
    self.map_id = self.map_object.id

  def testPost(self):
    """Tests the Publish handler."""
    handler = test_utils.SetupHandler(
        '/crisismap/publish', publish.Publish(),
        'domain=foo.com&label=abc&map_id=%s' % self.map_id)
    handler.post()
    entry = model.CatalogEntry.Get('foo.com', 'abc')
    self.assertEquals(self.map_id, entry.map_id)
    self.assertFalse(entry.is_listed)

  def testInvalidLabels(self):
    """Tests to makes sure invalid labels don't get published."""
    invalid_labels = ['', '!', 'f#oo', '?a', 'qwerty!', '9 3']
    for label in invalid_labels:
      handler = test_utils.SetupHandler(
          '/crisismap/publish', publish.Publish(),
          'domain=foo.com&label=%s&map_id=%s' % (label, self.map_id))
      self.assertRaises(base_handler.Error, handler.post)

  def testValidLabels(self):
    """Tests to makes sure valid labels do get published."""
    valid_labels = ['a', 'B', '2', 'a2', 'q-w_e-r_t-y', '93']
    for label in valid_labels:
      handler = test_utils.SetupHandler(
          '/crisismap/publish', publish.Publish(),
          'domain=foo.com&label=%s&map_id=%s' % (label, self.map_id))
      handler.post()
      entry = model.CatalogEntry.Get('foo.com', label)
      self.assertNotEqual(entry, None)
      self.assertEquals(self.map_id, entry.map_id)
      self.assertFalse(entry.is_listed)

if __name__ == '__main__':
  test_utils.main()
