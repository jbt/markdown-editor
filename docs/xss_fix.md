# Cross-Site Scripting Fix

Issue [#106](https://github.com/jbt/markdown-editor/issues/106) reports that the application
has cross-site scripting (XSS) vulnerabilities.

## XSS Attack Examples

```
<EMBED SRC="data:image/svg+xml;base64 PHN2ZyB4bWxuczpzdmc9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjAiIHg9IjAiIHk9IjAiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGlkPSJ4c3MiPjxzY3JpcHQgdHlwZT0idGV4dC9lY21hc2NyaXB0Ij5hbGVydCgieHNzISIpOzwvc2NyaXB0Pjwvc3ZnPg==" type="image/svg+xml" AllowScriptAccess="always"></EMBED>
```

```
<sup style="position:fixed;left:0;top:0;width:10000px;height:10000px;" onmouseover="alert('xss')">sup</sup>
```

```
<abbr style="position:fixed;left:0;top:0;width:10000px;height:10000px;" onmouseover="alert('xss')">abbr</abbr>
```

## Current Solution

* When changes are made in the CodeMirror editor, search through the new value using a regular expression to match all HTML elements which satisfy one of the following conditions:
    * The `AllowScriptAccess` attribute is set to `always` or `sameDomain`.
    * An attribute with the `on` prefix is present, indicating an event handler is being attached to the element (i.e. `onmouseover`).
* For each match, remove the entire HTML element string from the new value before updating the markdown preview. Both the CodeMirror editor and markdown preview will no longer contain the illegal HTML input.