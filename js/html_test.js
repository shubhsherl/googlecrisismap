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

// Author: kpy@google.com (Ka-Ping Yee)

function HtmlTest() {
}
registerTestSuite(HtmlTest);

/** Make gjstest use our .equals() for expectEq and expectNe. */
cm.Html.prototype.gjstestEquals = cm.Html.prototype.equals;

/** Exercises the Html constructor and the getUnsanitizedHtml() getter. */
HtmlTest.prototype.constructorAndGetUnsanitizedHtml = function() {
  expectEq(cm.Html.EMPTY, new cm.Html());
  expectEq(new cm.Html('abc'), new cm.Html('abc'));
  expectEq('xyz', (new cm.Html('xyz')).getUnsanitizedHtml());
};

/** Verifies that fromText escapes special characters properly. */
HtmlTest.prototype.fromText = function() {
  expectEq(cm.Html.fromSanitizedHtml('ab&lt;c&amp;d&gt;e&quot;f'),
           cm.Html.fromText('ab<c&d>e"f'));
};

/** Verifies that fromSanitizedHtml constructs Html instances correctly. */
HtmlTest.prototype.fromSanitizedHtml = function() {
  expectEq('xyz', cm.Html.fromSanitizedHtml('xyz').getUnsanitizedHtml());
  expectEq('xyz', cm.Html.fromSanitizedHtml('xyz').getHtml());
  expectEq('<b>a</b>',
           cm.Html.fromSanitizedHtml('<b>a</b>').getUnsanitizedHtml());
  expectEq('<b>a</b>', cm.Html.fromSanitizedHtml('<b>a</b>').getHtml());
};

/** Verifies that fromElement constructs Html instances correctly. */
HtmlTest.prototype.fromElement = function() {
  element = {innerHTML: 'abc'};
  expectEq(new cm.Html('abc'), cm.Html.fromElement(element));
};

/** Verifies that isEmpty works correctly. */
HtmlTest.prototype.isEmpty = function() {
  expectTrue((new cm.Html('')).isEmpty());
  expectFalse((new cm.Html('x')).isEmpty());
};

/** Verifies that .equals() works correctly. */
HtmlTest.prototype.equals = function() {
  // expectEq and expectNe call .gjsTestEquals(), which is actually .equals().
  expectEq(new cm.Html('a'), new cm.Html('a'));
  expectNe(new cm.Html('a'), new cm.Html('b'));
  expectNe(new cm.Html('a'), cm.Html.EMPTY);
  expectNe(new cm.Html('a'), null);

  // equals() should detect when fromSanitizedHtml() constructs something
  // that doesn't match the actual sanitizer output.
  expectNe(cm.Html.fromSanitizedHtml('<script>'), new cm.Html('<script>'));
  expectNe(new cm.Html('<script>'), cm.Html.fromSanitizedHtml('<script>'));

  // equals() should be compatible with lazy sanitization.
  var sanitizerPending = new cm.Html('a');
  var sanitizerDone = new cm.Html('a');
  sanitizerDone.getHtml();
  expectEq(sanitizerPending, sanitizerDone);

  sanitizerPending = new cm.Html('a');
  sanitizerDone = new cm.Html('a');
  sanitizerDone.getHtml();
  expectEq(sanitizerDone, sanitizerPending);
};

/** Verifies that toString protects us from leakage of unsafe HTML. */
HtmlTest.prototype.toString = function() {
  var dangerous = new cm.Html('<script>');
  expectEq('<!-- Unsanitized: &lt;script&gt; -->', dangerous.toString());

  // Accidental automatic string conversion should not leak unsafe HTML.
  expectEq('xyz<!-- Unsanitized: &lt;script&gt; -->', 'xyz' + dangerous);
};

/** Verifies that toText converts HTML entities correctly. */
HtmlTest.prototype.toText = function() {
  expectEq('ab<c&d>e"f', (new cm.Html('ab&lt;c&amp;d&gt;e&quot;f')).toText());
  expectEq('abcdef', (new cm.Html('ab<a href="foo">cd</a>ef')).toText());
};

/** Verifies that getHtml sanitizes HTML. */
HtmlTest.prototype.getHtml = function() {
  // This is where we would test the sanitizer, but right now we are just
  // using a stub to avoid pulling in all the sanitizer code.
  expectEq('<!-- no sanitizer available -->', (new cm.Html('a')).getHtml());
};

/** Verifies that pasteInto populates the content of a DOM element. */
HtmlTest.prototype.pasteInto = function() {
  var element = {};
  (new cm.Html('a')).pasteInto(element);
  expectEq('<!-- no sanitizer available -->', element.innerHTML);
};
