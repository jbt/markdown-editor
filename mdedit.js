(function (root, factory) {
    if (typeof define === 'function' && define['amd']) {
        // AMD. Register as an anonymous module.
        define(['prismjs'], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module['exports'] = factory(require('prismjs'));
    } else {
        // Browser globals (root is window)
        root['mdEdit'] = factory(root['Prism']);
    }
}(this, function (Prism) {
var yaml = {
  'scalar': {
    'pattern': /([\-:]\s*(![^\s]+)?[ \t]*[|>])[ \t]*(?:(\n[ \t]+)[^\r\n]+(?:\3[^\r\n]+)*)/,
    'lookbehind': true,
    'alias': 'string'
  },
  'comment': /#[^\n]+/,
  'key': {
    'pattern': /(\s*[:\-,[{\n?][ \t]*(![^\s]+)?[ \t]*)[^\n{[\]},#]+?(?=\s*:\s)/,
    'lookbehind': true,
    'alias': 'atrule'
  },
  'directive': {
    'pattern': /((^|\n)[ \t]*)%[^\n]+/,
    'lookbehind': true,
    'alias': 'important'
  },
  'datetime': {
    'pattern': /([:\-,[{]\s*(![^\s]+)?[ \t]*)(\d{4}-\d\d?-\d\d?([tT]|[ \t]+)\d\d?:\d{2}:\d{2}(\.\d*)?[ \t]*(Z|[-+]\d\d?(:\d{2})?)?|\d{4}-\d{2}-\d{2}|\d\d?:\d{2}(:\d{2}(\.\d*)?)?)(?=[ \t]*(\n|$|,|]|}))/,
    'lookbehind': true,
    'alias': 'number'
  },
  'boolean': {
    'pattern': /([:\-,[{]\s*(![^\s]+)?[ \t]*)(true|false)[ \t]*(?=\n|$|,|]|})/i,
    'lookbehind': true,
    'alias': 'important'
  },
  'null': {
    'pattern': /([:\-,[{]\s*(![^\s]+)?[ \t]*)(null|~)[ \t]*(?=\n|$|,|]|})/i,
    'lookbehind': true,
    'alias': 'important'
  },
  'string': {
    'pattern': /([:\-,[{]\s*(![^\s]+)?[ \t]*)("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')(?=[ \t]*(\n|$|,|]|}))/,
    'lookbehind': true
  },
  'number': {
    'pattern': /([:\-,[{]\s*(![^\s]+)?[ \t]*)[+\-]?(0x[\dA-Fa-f]+|0o[0-7]+|(\d+\.?\d*|\.?\d+)(e[\+\-]?\d+)?|\.inf|\.nan)[ \t]*(?=\n|$|,|]|})/i,
    'lookbehind': true
  },
  'tag': /![^\s]+/,
  'important': /[&*][\w]+/,
  'punctuation': /([:[\]{}\-,|>?]|---|\.\.\.)/
};
var md = (function(){
  var md = {
    'comment': Prism['languages']['markup']['comment']
  };


  md['front-matter'] = {
    'pattern': /^---\n[\s\S]*?\n---(?=\n|$)/,
    'inside': {
      'marker front-matter-marker start': /^---/,
      'marker front-matter-marker end': /---$/,
      'rest': yaml
    }
  };


  var inlines = {};
  var blocks = {};

  function inline(name, def){
    blocks[name] = inlines[name] = md[name] = def;
  }
  function block(name, def){
    blocks[name] = md[name] = def;
  }


  var langAliases = {
    'markup': [ 'markup', 'html', 'xml' ],
    'javascript': [ 'javascript', 'js' ]
  };

  for(var i in Prism['languages']){
    if(!Prism['languages'].hasOwnProperty(i)) continue;
    var l = Prism['languages'][i];
    if(typeof l === 'function') continue;

    var aliases = langAliases[i];
    var matches = aliases ? aliases.join('|') : i;

    block('code-block fenced ' + i, {
      'pattern': new RegExp('(^ {0,3}|\\n {0,3})(([`~])\\3\\3) *(' + matches + ')( [^`\n]*)? *\\n(?:[\\s\\S]*?)\\n {0,3}(\\2\\3*(?= *\\n)|$)', 'gi'),
      'lookbehind': true,
      'inside': {
        'code-language': {
          'pattern': /(^([`~])\2+)((?!\2)[^\2\n])+/,
          'lookbehind': true
        },
        'marker code-fence start': /^([`~])\1+/,
        'marker code-fence end': /([`~])\1+$/,
        'code-inner': {
          'pattern': /(^\n)[\s\S]*(?=\n$)/,
          'lookbehind': true,
          'alias': 'language-' + i,
          'inside': l
        }
      }
    });
  }


  block('code-block fenced untagged', {
    'pattern': /(^ {0,3}|\n {0,3})(([`~])\3\3)[^`\n]*\n(?:[\s\S]*?)\n {0,3}(\2\3*(?= *\n)|$)/g,
    'lookbehind': true,
    'inside': {
      'code-language': {
        'pattern': /(^([`~])\2+)((?!\2)[^\2\n])+/,
        'lookbehind': true
      },
      'marker code-fence start': /^([`~])\1+/,
      'marker code-fence end': /([`~])\1+$/,
      'code-inner': {
        'pattern': /(^\n)[\s\S]*(?=\n$)/,
        'lookbehind': true
      }
    }
  });


  block('heading setext-heading heading-1', {
    'pattern': /^ {0,3}[^\s].*\n {0,3}=+[ \t]*$/gm,
    'inside': {
      'marker heading-setext-line': {
        'pattern': /^( {0,3}[^\s].*\n) {0,3}=+[ \t]*$/gm,
        'lookbehind': true
      },
      'rest': inlines
    }
  });

  block('heading setext-heading heading-2', {
    'pattern': /^ {0,3}[^\s].*\n {0,3}-+[ \t]*$/gm,
    'inside': {
      'marker heading-setext-line': {
        'pattern': /^( {0,3}[^\s].*\n) {0,3}-+[ \t]*$/gm,
        'lookbehind': true
      },
      'rest': inlines
    }
  });

  var headingInside = {
    'marker heading-hash start': /^ *#+ */,
    'marker heading-hash end': / +#+ *$/,
    'rest': inlines
  };
  for(var i = 1; i <= 6; i += 1){
    block('heading heading-'+i, {
      'pattern': new RegExp('^ {0,3}#{'+i+'}(?![#\\S]).*$', 'gm'),
      'inside': headingInside
    });
  }



  var linkText = {
    'pattern': /^\[(?:\\.|[^\[\]]|\[[^\[\]]*\])*\]/,
    'inside': {
      'marker bracket start': /^\[/,
      'marker bracket end': /\]$/,
      'link-text-inner': {
        'pattern': /[\w\W]+/,
        'inside': inlines
      }
    }
  };

  var linkLabel = {
    'pattern': /\[(?:\\.|[^\]])*\]/,
    'inside': {
      'marker bracket start': /^\[/,
      'marker bracket end': /\]$/,
      'link-label-inner': /[\w\W]+/
    }
  };

  var imageText = {
    'pattern': /^!\[(?:\\.|[^\[\]]|\[[^\[\]]*\])*\]/,
    'inside': {
      'marker image-bang': /^!/,
      'marker bracket start': /^\[/,
      'marker bracket end': /\]$/,
      'image-text-inner': {
        'pattern': /[\w\W]+/,
        'inside': inlines
      }
    }
  };

  var linkURL = {
    'pattern': /^(\s*)(?!<)(?:\\.|[^\(\)\s]|\([^\(\)\s]*\))+/,
    'lookbehind': true
  };

  var linkBracedURL = {
    'pattern': /^(\s*)<(?:\\.|[^<>\n])*>/,
    'lookbehind': true,
    'inside': {
      'marker brace start': /^</,
      'marker brace end': />$/,
      'braced-href-inner': /[\w\W]+/
    }
  };

  var linkTitle = {
    'pattern': /('(?:\\'|[^'])+'|"(?:\\"|[^"])+")\s*$/,
    // 'lookbehind': true,
    'inside': {
      'marker quote start': /^['"]/,
      'marker quote end': /['"]$/,
      'title-inner': /[\w\W]+/
    }
  };

  var linkParams = {
    'pattern': /\( *(?:(?!<)(?:\\.|[^\(\)\s]|\([^\(\)\s]*\))*|<(?:[^<>\n]|\\.)*>)( +('(?:[^']|\\')+'|"(?:[^"]|\\")+"))? *\)/,
    'inside': {
      'marker bracket start': /^\(/,
      'marker bracket end': /\)$/,
      'link-params-inner': {
        'pattern': /[\w\W]+/,
        'inside': {
          'link-title': linkTitle,
          'href': linkURL,
          'braced-href': linkBracedURL
        }
      }
    }
  };




  block('hr', {
    'pattern': /^[\t ]*([*\-_])([\t ]*\1){2,}([\t ]*$)/gm,
    'inside': {
      'marker hr-marker': /[*\-_]/g
    }
  });

  block('urldef', {
    'pattern': /^( {0,3})\[(?:\\.|[^\]])+]: *\n? *(?:(?!<)(?:\\.|[^\(\)\s]|\([^\(\)\s]*\))*|<(?:[^<>\n]|\\.)*>)( *\n? *('(?:\\'|[^'])+'|"(?:\\"|[^"])+"))?$/gm,
    'lookbehind': true,
    'inside': {
      'link-label': linkLabel,
      'marker urldef-colon': /^:/,
      'link-title': linkTitle,
      'href': linkURL,
      'braced-href': linkBracedURL
    }
  });

  block('blockquote', {
    'pattern': /^[\t ]*>[\t ]?.+(?:\n(?!\n)|.)*/gm,
    'inside': {
      'marker quote-marker': /^[\t ]*>[\t ]?/gm,
      'blockquote-content': {
        'pattern': /[^>]+/,
        'rest': blocks
      }
    }
  });

  block('list', {
    'pattern': /^[\t ]*([*+\-]|\d+\.)[\t ].+(?:\n(?!\n)|.)*/gm,
    'inside': {
      'li': {
        'pattern': /^[\t ]*([*+\-]|\d+\.)[\t ].+(?:\n|[ \t]+[^*+\- \t].*\n)*/gm,
        'inside': {
          'marker list-item': /^[ \t]*([*+\-]|\d+\.)[ \t]/m,
          'rest': blocks
        }
      }
    }
  });

  block('code-block indented', {
    'pattern': /(^|(?:^|(?:^|\n)(?![ \t]*([*+\-]|\d+\.)[ \t]).*\n)\s*?\n)((?: {4}|\t).*(?:\n|$))+/g,
    'lookbehind': true
  });

  block('p', {
    'pattern': /[^\n](?:\n(?!\n)|.)*[^\n]/g,
    'inside': inlines
  });

  inline('image', {
    'pattern': /(^|[^\\])!\[(?:\\.|[^\[\]]|\[[^\[\]]*\])*\]\(\s*(?:(?!<)(?:\\.|[^\(\)\s]|\([^\(\)\s]*\))*|<(?:[^<>\n]|\\.)*>)(\s+('(?:[^']|\\')+'|"(?:[^"]|\\")+"))?\s*\)/,
    'lookbehind': true,
    'inside': {
      'link-text': imageText,
      'link-params': linkParams
    }
  });

  inline('link', {
    'pattern': /(^|[^\\])\[(?:\\.|[^\[\]]|\[[^\[\]]*\])*\]\(\s*(?:(?!<)(?:\\.|[^\(\)\s]|\([^\(\)\s]*\))*|<(?:[^<>\n]|\\.)*>)(\s+('(?:[^']|\\')+'|"(?:[^"]|\\")+"))?\s*\)/,
    'lookbehind': true,
    'inside': {
      'link-text': linkText,
      'link-params': linkParams
    }
  });

  inline('image image-ref', {
    'pattern': /(^|[^\\])!\[(?:\\.|[^\[\]]|\[[^\[\]]*\])*\] ?\[(?:\\.|[^\]])*\]/,
    'lookbehind': true,
    'inside': {
      'link-text': imageText,
      'link-label': linkLabel
    }
  });
  inline('link link-ref', {
    'pattern': /(^|[^\\])\[(?:\\.|[^\[\]]|\[[^\[\]]*\])*\] ?\[(?:\\.|[^\]])*\]/,
    'lookbehind': true,
    'inside': {
      'link-text': linkText,
      'link-label': linkLabel
    }
  });

  inline('image image-ref shortcut-ref', {
    'pattern': /(^|[^\\])!\[(?:\\.|[^\[\]]|\[[^\[\]]*\])*\]/,
    'lookbehind': true,
    'inside': {
      'marker image-bang': /^!/,
      'link-text': linkText
    }
  });
  inline('link link-ref shortcut-ref', {
    'pattern': /(^|[^\\])\[(?:\\.|[^\[\]]|\[[^\[\]]*\])*\]/,
    'lookbehind': true,
    'inside': {
      'link-text': linkText
    }
  });


  inline('code', {
    'pattern': /(^|[^\\])(`+)([^\r]*?[^`])\2(?!`)/g,
    'lookbehind': true,
    'inside': {
      'marker code-marker start': /^`/,
      'marker code-marker end': /`$/,
      'code-inner': /[\w\W]+/
    }
  });

  inline('strong', {
    'pattern': /(^|[^\\*_]|\\[*_])([_\*])\2(?:\n(?!\n)|.)+?\2{2}(?!\2)/g,
    // 'pattern': /(^|[^\\])(\*\*|__)(?:\n(?!\n)|.)+?\2/,
    'lookbehind': true,
    'inside': {
      'marker strong-marker start': /^(\*\*|__)/,
      'marker strong-marker end': /(\*\*|__)$/,
      'strong-inner': {
        'pattern': /[\w\W]+/,
        'inside': inlines
      }
    }
  });

  inline('em', {
    // 'pattern': /(^|[^\\])(\*|_)(\S[^\2]*?)??[^\s\\]+?\2/g,
    'pattern': /(^|[^\\*_]|\\[*_])(\*|_)(?:\n(?!\n)|.)+?\2(?!\2)/g,
		'lookbehind': true,
    'inside': {
      'marker em-marker start': /^(\*|_)/,
      'marker em-marker end': /(\*|_)$/,
      'em-inner': {
        'pattern': /[\w\W]+/,
        'inside': inlines
      }
    }
  });

  inline('strike', {
    'pattern': /(^|\n|(?!\\)\W)(~~)(?=\S)([^\r]*?\S)\2/gm,
    'lookbehind': true,
    'inside': {
      'marker strike-marker start': /^~~/,
      'marker strike-marker end': /~~$/,
      'strike-inner': {
        'pattern': /[\w\W]+/,
        'inside': inlines
      }
    }
  });

  inline('comment', Prism['languages']['markup']['comment']);

  var tag = Prism['languages']['markup']['tag'];
  var tagMatch = tag['pattern'];

  inline('tag', {
    'pattern': new RegExp("(^|[^\\\\])" + tagMatch.source, 'i'),
    'lookbehind': true,
    'inside': tag['inside']
  });
  inline('entity', Prism['languages']['markup']['entity']);

  return md;
})();

var evt = {
  bind: function(el, evt, fn){
    el.addEventListener(evt, fn, false);
  }
};


function spliceString(str, i, remove, add){
  remove = +remove || 0;
  add = add || '';

  return str.slice(0,i) + add + str.slice(i+remove);
}

var actions = {
  'newline': function(state, options){
    var s = state.start;
    var lf = state.before.lastIndexOf('\n') + 1;
    var afterLf = state.before.slice(lf);
    var indent = afterLf.match(/^\s*/)[0];
    var add = indent;
    var clearPrevLine = false;

    if(/^ {0,3}$/.test(indent)){ // maybe list
      var l = afterLf.slice(indent.length);
      if(/^[*+\-]\s+/.test(l)){
        add += l.match(/^[*+\-]\s+/)[0];
        clearPrevLine = /^[*+\-]\s+$/.test(l);
      }else if(/^\d+\.\s+/.test(l)){
        add += l.match(/^\d+\.\s+/)[0]
                .replace(/^\d+/, function(n){ return +n+1; });
        clearPrevLine = /^\d+\.\s+$/.test(l);
      }else if(/^>/.test(l)){
        add += l.match(/^>\s*/)[0];
        clearPrevLine = /^>\s*$/.test(l);
      }
    }

    add = '\n' + add;

    var del = state.sel;
    state.sel = '';

    if(clearPrevLine){ // if prev line was actually an empty liste item, clear it
      del = afterLf + del;
      state.before = state.before.slice(0, lf);
      state.start -= afterLf.length;
      s -= afterLf.length;
      add = '\n';
    }

    state.before += add;
    state.start += add.length;
    state.end = state.start;

    return { add: add, del: del, start: s };
  },

  'indent': function(state, options){
    var lf = state.before.lastIndexOf('\n') + 1;

    // TODO deal with soft tabs

    if(options.inverse){
      if(/\s/.test(state.before.charAt(lf))){
        state.before = spliceString(state.before, lf, 1);
        state.start -= 1;
      }
      state.sel = state.sel.replace(/\r?\n(?!\r?\n)\s/, '\n');
    }else if(state.sel || options.ctrl){
      state.before = spliceString(state.before, lf, 0, '\t');
      state.sel = state.sel.replace(/\r?\n/, '\n\t');
      state.start += 1;
    }else{
      state.before += '\t';
      state.start += 1;
      state.end  += 1;

      return { add: '\t', del: '', start: state.start - 1 };
    }

    state.end = state.start + state.sel.length;

    return {
      action: 'indent',
      start: state.start,
      end: state.end,
      inverse: options.inverse
    };
  },

  'wrap': function(state, options){
    var match = {
      '(': ')',
      '[': ']',
      '{': '}',
      '<': '>'
    }[options.bracket] || options.bracket;

    state.before += options.bracket;
    state.after = match + state.after;
    state.start += 1;
    state.end += 1;

    return {
      add: options.bracket + state.sel + match,
      del: state.sel,
      start: state.start - 1,
      end: state.end - 1
    };
  }
};
function SelectionManager(elt){
	this.elt = elt;
}

SelectionManager.prototype.getStart = function(){
	var selection = getSelection();

	if(!selection.rangeCount) return 0;

	var range = selection.getRangeAt(0);
	var el = range.startContainer;
	var container = el;
	var offset = range.startOffset;

	if(!(this.elt.compareDocumentPosition(el) & 0x10)){
		// selection is outside this element.
		return 0;
	}

	do{
		while((el = el.previousSibling)){
			if(el.textContent){
				offset += el.textContent.length;
			}
		}

		el = container = container.parentNode;
	}while(el && el !== this.elt);

	return offset;
};

SelectionManager.prototype.getEnd = function(){
	var selection = getSelection();

	if(!selection.rangeCount) return 0;

	return this.getStart() + String(selection.getRangeAt(0)).length;
};

SelectionManager.prototype.setRange = function(start, end, noscroll){
	var range = document.createRange();
	var startOffset = findOffset(this.elt, start);
	var endOffset = startOffset;
	if(end && end !== start){
		endOffset = findOffset(this.elt, end);
	}else{
		if(noscroll !== false) scrollToCaret.call(this, endOffset.element, endOffset.offset);
	}

	range.setStart(startOffset.element, startOffset.offset);
	range.setEnd(endOffset.element, endOffset.offset);

	var selection = getSelection();
	selection.removeAllRanges();
	selection.addRange(range);
};



var caret = document.createElement('span');
caret.style.position = 'absolute';
caret.innerHTML = '|';

function scrollToCaret(el, offset){
	var t = el.textContent;
	var p = el.parentNode;
	var before = t.slice(0, offset);
	var after = t.slice(offset);

	el.textContent = after;
	var b4 = document.createTextNode(before);
	p.insertBefore(caret, el);
	p.insertBefore(b4, caret);

	// caret.scrollIntoViewIfNeeded();
	var tp = caret.offsetTop;
	var h = caret.offsetHeight;
	var ch = this.elt.offsetHeight;
	var st = this.elt.scrollTop;

	el.textContent = t;
	p.removeChild(caret);
	p.removeChild(b4);

	if(tp - st < 0){
		this.elt.scrollTop = tp;
	}else if(tp - st + h > ch){
		this.elt.scrollTop = tp + h - ch;
	}
}




function findOffset(root, ss) {
	if(!root) {
		return null;
	}

	var offset = 0,
		element = root;

	do {
		var container = element;
		element = element.firstChild;

		if(element) {
			do {
				var len = element.textContent.length;

				if(offset <= ss && offset + len > ss) {
					break;
				}

				offset += len;
			} while(element = element.nextSibling);
		}

		if(!element) {
			// It's the container's lastChild
			break;
		}
	} while(element && element.hasChildNodes() && element.nodeType != 3);

	if(element) {
		return {
			element: element,
			offset: ss - offset
		};
	}
	else if(container) {
		element = container;

		while(element && element.lastChild) {
			element = element.lastChild;
		}

		if(element.nodeType === 3) {
			return {
				element: element,
				offset: element.textContent.length
			};
		}
		else {
			return {
				element: element,
				offset: 0
			};
		}
	}

	return {
		element: root,
		offset: 0,
		error: true
	};
}
function UndoManager(editor){
  this.editor = editor;

  this.undoStack = [];
  this.redoStack = [];
}

UndoManager.prototype.action = function(a){
  /// sanity?

  if(this.undoStack.length && this.canCombine(this.undoStack[this.undoStack.length-1], a)){
    this.undoStack.push(this.combine(this.undoStack.pop(), a));
  }else{
    this.undoStack.push(a);
  }
  this.redoStack = [];
};

UndoManager.prototype.canCombine = function(a, b){
  return (
    !a.action && !b.action &&
    !Array.isArray(a) && !Array.isArray(b) &&
    !(a.del && b.add) && !(a.add && b.del) &&
    !(a.add && !b.add) && !(!a.add && b.add) &&
    !(a.add && a.del) &&
    !(b.add && b.del) &&
    a.start + a.add.length === b.start + b.del.length
  );
};

UndoManager.prototype.combine = function(a, b){
  return {
    add: a.add + b.add,
    del: b.del + a.del,
    start: Math.min(a.start, b.start)
  };
};

UndoManager.prototype.undo = function(){
  if(!this.undoStack.length) return;

  var a = this.undoStack.pop();
  this.redoStack.push(a);

  this.applyInverse(a);
};

UndoManager.prototype.redo = function(){
  if(!this.redoStack.length) return;

  var a = this.redoStack.pop();
  this.undoStack.push(a);

  this.apply(a);
};

UndoManager.prototype.apply = function apply(a){
  if(Array.isArray(a)){
    a.forEach(apply.bind(this));
    return;
  }

  if(a.action){
    this.editor.action(a.action, {
      inverse: a.inverse,
      start: a.start,
      end: a.end,
      noHistory: true
    });
  }else{
    this.editor.apply(a);
  }
};

UndoManager.prototype.applyInverse = function inv(a){
  if(Array.isArray(a)){
    a.forEach(inv.bind(this));
    return;
  }

  if(a.action){
    this.editor.action(a.action, {
      inverse: !a.inverse,
      start: a.start,
      end: a.end,
      noHistory: true
    });
  }else{
    this.editor.apply({
      start: a.start,
      end: a.end,
      del: a.add,
      add: a.del
    });
  }
};
function Editor(el, opts){

  if(!(this instanceof Editor)){
    return new Editor(el, opts);
  }

  opts = opts || {};

  if(el.tagName === 'PRE'){
    this.el = el;
  }else{
    this.el = document.createElement('pre');
    el.appendChild(this.el);
  }

  var cname = opts['className'] || '';

  this.el.className = 'mdedit' + (cname ? ' ' + cname : '');
  this.el.setAttribute('contenteditable', true);

  this.selMgr = new SelectionManager(el);
  this.undoMgr = new UndoManager(this);

  evt.bind(el, 'cut', this.cut.bind(this));
  evt.bind(el, 'paste', this.paste.bind(this));
  evt.bind(el, 'keyup', this.keyup.bind(this));
  evt.bind(el, 'input', this.changed.bind(this));
  evt.bind(el, 'keydown', this.keydown.bind(this));
  evt.bind(el, 'keypress', this.keypress.bind(this));


  var changeCb = opts['change'];
  this.changeCb = changeCb || function(){};

  this.changed();
}

Editor.prototype.fireChange = function(){
  var prev = this._prevValue;
  var now = this.getValue();
  if(prev !== now){
    this.changeCb(now);
    this._prevValue = now;
  }
};

Editor.prototype['setValue'] = function(val){
  this.el.textContent = val;
  this.changed();
};

Editor.prototype['getValue'] = function(){
  return this.el.textContent;
};

Editor.prototype.keyup = function(evt){
  var keyCode = evt && evt.keyCode || 0,
      code = this.el.textContent;

  // if(keyCode < 9 || keyCode == 13 || keyCode > 32 && keyCode < 41) {
    // $t.trigger('caretmove');
  // }

  if([
    9, 91, 93, 16, 17, 18, // modifiers
    20, // caps lock
    13, // Enter (handled by keydown)
    112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, // F[0-12]
    27 // Esc
  ].indexOf(keyCode) > -1) {
    return;
  }

  if([
    33, 34, // PgUp, PgDn
    35, 36, // End, Home
    37, 39, 38, 40 // Left, Right, Up, Down
  ].indexOf(keyCode) === -1) {
    this.changed();
  }
};

Editor.prototype.changed = function(evt){
  var code = this.el.textContent;

  var ss = this.selMgr.getStart(),
    se = this.selMgr.getEnd();

  this.saveScrollPos();

  if(code === this._prevCode){
    if(this.el.innerHTML !== this._prevHTML) this.el.innerHTML = this._prevHTML;
  }else{
    this._prevHTML = this.el.innerHTML = Prism['highlight'](code, md);
  }
  this._prevCode = code;
  // Prism.highlightElement(this); // bit messy + unnecessary + strips leading newlines :(

  if(!/\n$/.test(code)) {
    this.el.innerHTML = this.el.innerHTML + '\n';
  }

  this.restoreScrollPos();

  if(ss !== null || se !== null) {
    this.selMgr.setRange(ss, se);
  }

  this.fireChange();
};

Editor.prototype.saveScrollPos = function(){
  if(this.st === undefined) this.st = this.el.scrollTop;
  setTimeout(function(){
    this.st = undefined;
  }.bind(this), 500);
};

Editor.prototype.restoreScrollPos = function(){
  this.el.scrollTop = this.st;
  this.st = undefined;
};


Editor.prototype.keypress = function(evt){
  var ctrl = evt.metaKey || evt.ctrlKey;

  if(ctrl) return;

  var code = evt.charCode;

  if(!code) return;

  var start = this.selMgr.getStart();
  var end = this.selMgr.getEnd();

  var chr = String.fromCharCode(code);

  if(/[\[\{\(<"'~\*_]/.test(chr) && start !== end){
    this.action('wrap', {
      bracket: chr
    });
    evt.preventDefault();
    return;
  }


  this.undoMgr.action({
    add: chr,
    del: start === end ? '' : this.el.textContent.slice(start, end),
    start: start
  });
};

Editor.prototype.keydown = function(evt){
  var cmdOrCtrl = evt.metaKey || evt.ctrlKey;

  switch(evt.keyCode) {
    case 8: // Backspace
    case 46: // Delete
      var start = this.selMgr.getStart();
      var end = this.selMgr.getEnd();
      var length = start === end ? 1 : Math.abs(end - start);
      start = evt.keyCode === 8 ? end - length : start;
      this.undoMgr.action({
        add: '',
        del: this.el.textContent.slice(start, start + length),
        start: start
      });
      break;
    case 9: // Tab
      if(!cmdOrCtrl) {
        this.action('indent', {
          inverse: evt.shiftKey
        });
        evt.preventDefault();
      }
      break;
    case 219: // [
    case 221: // ]
      if(cmdOrCtrl && !evt.shiftKey) {
        this.action('indent', {
          inverse: evt.keyCode === 219,
          ctrl: true
        });
        evt.preventDefault();
      }
      break;
    case 13:
      this.action('newline');
      evt.preventDefault();
      break;
    case 89:
      if(cmdOrCtrl){
        this.undoMgr.redo();
        evt.preventDefault();
      }
      break;
    case 90:
      if(cmdOrCtrl) {
        evt.shiftKey ? this.undoMgr.redo() : this.undoMgr.undo();
        evt.preventDefault();
      }

      break;
    case 191:
      // if(cmdOrCtrl && !evt.altKey) {
      //   that.action('comment', { lang: this.id });
      //   return false;
      // }

      break;
  }
};

Editor.prototype.apply = function(action){
  var e = this.el;

  e.textContent = spliceString(e.textContent, action.start, action.del.length, action.add);
  this.selMgr.setRange(action.start, action.start + action.add.length);
  this.changed();
};

Editor.prototype.action = function(act, opts){
  opts = opts || {};
  var text = this.el.textContent;
  var start = opts.start || this.selMgr.getStart();
  var end = opts.end || this.selMgr.getEnd();

  var state = {
    start: start,
    end: end,
    before: text.slice(0, start),
    after: text.slice(end),
    sel: text.slice(start, end)
  };

  var a = actions[act](state, opts);

  this.saveScrollPos();

  this.el.textContent = state.before + state.sel + state.after;

  if(a && !opts.noHistory){
    this.undoMgr.action(a);
  }
  this.selMgr.setRange(state.start, state.end, false);

  this.changed();

};

Editor.prototype.cut = function(){
  var start = this.selMgr.getStart();
  var end = this.selMgr.getEnd();
  if(start === end) return;

  this.undoMgr.action({
    add: '',
    del: this.el.textContent.slice(start, end),
    start: start
  });
};

Editor.prototype.paste = function(evt){
  var start = this.selMgr.getStart();
  var end = this.selMgr.getEnd();
  var selection = start === end ? '' : this.el.textContent.slice(start, end);

  if(evt.clipboardData){
    evt.preventDefault();

    var pasted = evt.clipboardData.getData('text/plain');

    this.apply({
      add: pasted,
      del: selection,
      start: start
    });

    this.undoMgr.action({
      add: pasted,
      del: selection,
      start: start
    });

    start += pasted.length;
    this.selMgr.setRange(start, start);
    this.changed();
  }
};

return Editor;

}));
