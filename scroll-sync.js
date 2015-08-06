var OUTPUT_SCROLLING = 1;
var INPUT_SCROLLING = 2;
var EDITING = 3;


function scrollSync(editor, output){

  var h1 = document.createElement('div');
  h1.style.background = 'red';
  h1.style.position = 'absolute';
  h1.style.left = '50%';
  h1.style.right = 0;
  h1.style.height = '1px';
  document.body.appendChild(h1);


  var h2 = document.createElement('div');
  h2.style.background = 'red';
  h2.style.position = 'absolute';
  h2.style.right = '50%';
  h2.style.left = 0;
  h2.style.height = '1px';
  document.body.appendChild(h2);

  var _scrollMode;
  var _scrollTimeout;
  function setScrollMode(mode){
    if(_scrollMode && _scrollMode !== mode){
      return false;
    }
    _scrollMode = mode;
    clearTimeout(_scrollTimeout);
    _scrollTimeout = setTimeout(function(){
      _scrollMode = null;
    }, 300);
    return true;
  }


  function outputScrolled(){
    if(!setScrollMode(OUTPUT_SCROLLING)) return;

    var st = output.scrollTop;
    var h = output.offsetHeight;
    var sh = output.scrollHeight;

    var progress = st / (sh - h);

    h1.style.top = (h * progress) + 'px';

    var line = getOutputLineAt(h * progress);

    scrollInputToLineAtProgress(line, progress);
  }

  function getOutputPositionMarkers(offsetByScroll){
    var els = output.getElementsByTagName('*');
    var st = output.scrollTop;
    if(!offsetByScroll) st = 0;
    var markers = [];
    for(var i = 0, l = els.length; i < l; i++){
      var e = els[i];
      var sl = e.getAttribute('source-lines');
      if(!sl) continue;
      var bits = sl.split(' ');
      var ot = e.offsetTop;
      var h = e.offsetHeight;
      var start = +bits[0];
      var end = +bits[1];

      markers.push({ y: ot - st, l: start });
      markers.push({ y: ot + h - st, l: end - 0.5 });
    }

    markers.sort(function(a, b){
      return a.y - b.y;
    });

    // last line end un-correction
    markers[markers.length - 1].l += 0.5;

    return markers;
  }

  function getOutputLineAt(px){
    var markers = getOutputPositionMarkers(true);

    if(markers[0].y > px){
      return 0;
    }
    if(markers[markers.length-1].y < px){
      return markers[markers.length-1].l + 0.5;
    }

    for(var i = 0; i < markers.length - 1; i += 1){
      var a = markers[i], b = markers[i + 1];
      if(a.y <= px && b.y > px){
        var perc = (px - a.y) / (b.y - a.y);
        return a.l + perc * (b.l - a.l);
      }
    }
  }

  function scrollInputToLineAtProgress(line, progress){
    var ei = editor.getScrollInfo();
    if(ei.height <= ei.clientHeight){
      // no scrolling at all
      return;
    }

    var padding = 30;

    var fl = Math.floor(line);

    var y1 = editor.heightAtLine(fl);
    var y2 = editor.heightAtLine(fl + 1);
    var y = y1 + (line - fl) * (y2 - y1);

    // TODO clientHeight seems to be off by 30px, not sure why
    var px = padding + progress * (ei.clientHeight - /* 2* */ padding);
    h2.style.top = px + 'px';

    editor.scrollTo(null, y - px + ei.top);
  }

  function inputScrolled(){
    if(!setScrollMode(INPUT_SCROLLING)) return;

    var ei = editor.getScrollInfo();
    if(ei.height <= ei.clientHeight){
      // no scrolling at all
      return;
    }

    var padding = 30;

    var st = ei.top;
    var h = ei.clientHeight;
    var sh = ei.height;

    var progress = st / (sh - h);

    var px = padding + progress * (ei.clientHeight - /* 2* */ padding);
    h2.style.top = px + 'px';


    var l1 = editor.lineAtHeight(px);

    var y1 = editor.heightAtLine(l1);
    var y2 = editor.heightAtLine(l1 + 1);

    var lineProgress = (px - y1) / (y2 - y1);
    if(y1 === y2){ lineProgress = 0; }

    var line = l1 + lineProgress;
    if(line < 0){ line = 0; }

    scrollOutputToLineAtProgress(line, progress);
  }

  function scrollOutputToLineAtProgress(line, progress){
    var h = output.offsetHeight;

    h1.style.top = (h * progress) + 'px';

    var markers = getOutputPositionMarkers();
    for(var i = 0; i < markers.length - 1; i += 1){
      var a = markers[i], b = markers[i + 1];
      if(a.l <= line && b.l > line){
        var prog = (line - a.l) / (b.l - a.l);
        var px = a.y + prog * (b.y - a.y);

        var ypx = px - (h * progress);
        output.scrollTop = ypx;

        return;
      }
    }

    // we got to the end. Oh well.
    output.scrollTop = output.scrollHeight;
  }


  output.addEventListener('scroll', outputScrolled);
  editor.on('scroll', inputScrolled);

}
