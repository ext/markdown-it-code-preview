---
title: HTML/CSS
---

# HTML/CSS examples

## Usage

````plaintext
```html
<div class="foo">
  <p>Lorem ipsum</p>
</div>
```
````

would render:

```html
<div class="foo">
  <p>Lorem ipsum</p>
</div>
```

Tags can be used to control the code preview:

````plaintext
```html nopreview
  markup
```
````

- `nopreview` - Render without live preview
- `nomarkup` - Render without source

Bonus: this works out-of-the-box with Prettier! `\o/`

## Examples

Default options, shows both running example and the markup used to generate it.

```html
<button type="button" onclick="alert('cluck cluck!')">click me!</button>
```

Without preview (`nopreview` tag):

```html nopreview
<button type="button" onclick="alert('cluck cluck!')">click me!</button>
```

Without markup (`nomarkup` tag):

```html nomarkup
<button type="button" onclick="alert('cluck cluck!')">click me!</button>
```
