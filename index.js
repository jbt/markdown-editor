var URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
navigator.saveBlob = navigator.saveBlob || navigator.msSaveBlob || navigator.mozSaveBlob || navigator.webkitSaveBlob;
window.saveAs = window.saveAs || window.webkitSaveAs || window.mozSaveAs || window.msSaveAs;

// Because highlight.js is a bit awkward at times
var languageOverrides = {
    js: 'javascript',
    html: 'xml'
};

var livestyles;

emojify.setConfig({
    img_dir: 'emoji'
});

var md = markdownit({
        html: true,
        highlight: function(code, lang) {
            if (languageOverrides[lang]) lang = languageOverrides[lang];
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return hljs.highlight(lang, code).value;
                } catch (e) {}
            }
            return '';
        }
    })
    .use(markdownitFootnote);

var hashto;

function update(e) {
    setOutput(e.getValue());

    //clearTimeout(hashto);
    //hashto = setTimeout(updateHash, 1000);
}

function setOutput(val) {
    val = val.replace(/<equation>((.*?\n)*?.*?)<\/equation>/ig, function(a, b) {
        return '<img src="http://latex.codecogs.com/png.latex?' + encodeURIComponent(b) + '" />';
    });

    var out = document.getElementById('out');
    var old = out.cloneNode(true);
    out.innerHTML = md.render(val);
    emojify.run(out);

    var allold = old.getElementsByTagName("*");
    if (allold === undefined) return;

    var allnew = out.getElementsByTagName("*");
    if (allnew === undefined) return;

    for (var i = 0, max = Math.min(allold.length, allnew.length); i < max; i++) {
        if (!allold[i].isEqualNode(allnew[i])) {
            out.scrollTop = allnew[i].offsetTop;
            return;
        }
    }
}

CodeMirrorSpellChecker({
    codeMirrorInstance: CodeMirror,
});

var editor = CodeMirror.fromTextArea(document.getElementById('code'), {
    mode: "spell-checker",
    backdrop: "gfm",
    lineNumbers: false,
    matchBrackets: true,
    lineWrapping: true,
    theme: 'base16-light',
    extraKeys: {
        "Enter": "newlineAndIndentContinueMarkdownList"
    }
});

editor.on('change', update);

document.addEventListener('drop', function(e) {
    e.preventDefault();
    e.stopPropagation();

    var reader = new FileReader();
    reader.onload = function(e) {
        editor.setValue(e.target.result);
    };

    reader.readAsText(e.dataTransfer.files[0]);
}, false);

function saveAsMarkdown() {
    save(editor.getValue(), "untitled.md");
}

function saveAsHtml() {
    save(document.getElementById('out').innerHTML, "untitled.html");
}

document.getElementById('saveas-markdown').addEventListener('click', function() {
    saveAsMarkdown();
    hideMenu();
});

document.getElementById('saveas-html').addEventListener('click', function() {
    saveAsHtml();
    hideMenu();
});

function save(code, name) {
    var blob = new Blob([code], {
        type: 'text/plain'
    });
    if (window.saveAs) {
        window.saveAs(blob, name);
    } else if (navigator.saveBlob) {
        navigator.saveBlob(blob, name);
    } else {
        url = URL.createObjectURL(blob);
        var link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", name);
        var event = document.createEvent('MouseEvents');
        event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
        link.dispatchEvent(event);
    }
}

var menuVisible = false;
var menu = document.getElementById('menu');

function showMenu() {
    menuVisible = true;
    menu.style.display = 'block';
}

function hideMenu() {
    menuVisible = false;
    menu.style.display = 'none';
}

document.getElementById('close-menu').addEventListener('click', function() {
    hideMenu();
});

document.addEventListener('keydown', function(e) {
    if (e.keyCode == 83 && (e.ctrlKey || e.metaKey)) {
        e.shiftKey ? showMenu() : saveAsMarkdown();

        e.preventDefault();
        return false;
    }

    if (e.keyCode === 27 && menuVisible) {
        hideMenu();

        e.preventDefault();
        return false;
    }
});

function clearEditor() {
    editor.setValue("");
}

function initEditor() {
    var mq = window.matchMedia("screen and (max-width: 1024px)");
    mq.addListener(manageSpiltView);
}

function manageSpiltView(mq) {
    console.log(mq);
    var inview = document.getElementById('in');
    var outview = document.getElementById('out');
    var isMDViewOn = document.getElementById('viewbutton').classList.contains('selected');
    if (mq.matches) {
        //HALF VIEW
        if (isMDViewOn) {
            //SHOW EDITOR
            inview.style.display = 'block';
            inview.style.width = '100%';
            outview.style.display = 'none';
        } else {
            //SHOW HTML
            inview.style.display = 'none';
            outview.style.display = 'block';
            outview.style.left = '0';
            outview.paddingLeft = '10px'
        }
    } else {
        //FULL VIEW
        inview.style.width = '50%';
        inview.style.display = 'block';
        outview.style.paddingLeft = '20px';
        outview.style.left = '50%';
        outview.style.display = 'block';
    }
}

function toggleEditorView(button) {
    button.classList.toggle('selected');
    manageSpiltView({ matches: true });
}

function toggleNightMode(button) {
    button.classList.toggle('selected');
    document.getElementById('toplevel').classList.toggle('nightmode');
}

function toggleReadMode(button) {
    button.classList.toggle('selected');
    document.getElementById('out').classList.toggle('focused');
    document.getElementById('in').classList.toggle('hidden');
}

function updateHash() {
    window.location.hash = btoa( // base64 so url-safe
        RawDeflate.deflate( // gzip
            unescape(encodeURIComponent( // convert to utf8
                editor.getValue()
            ))
        )
    );
}

function start() {
    if (window.location.hash) {
        var h = window.location.hash.replace(/^#/, '');
        if (h.slice(0, 5) == 'view:') {
            setOutput(decodeURIComponent(escape(RawDeflate.inflate(atob(h.slice(5))))));
            document.body.className = 'view';
        } else {
            editor.setValue(
                decodeURIComponent(escape(
                    RawDeflate.inflate(
                        atob(
                            h
                        )
                    )
                ))
            );
            update(editor);
            editor.focus();
        }
    } else {
        update(editor);
        editor.focus();
    }

    initEditor();
}

start();
