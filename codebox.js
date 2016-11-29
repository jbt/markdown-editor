function replaceAll(string, pattern, replacement) {
    return string.replace(new RegExp(pattern, "g"), replacement);
}

function prettifyLanguage(language) {
  switch (language) {
    case "cpp":
      return "C++";
    case "java":
      return "Java";
    case "python":
      return "Python";
    case "c#":
      return "C#";
    case "c":
      return "C";
    case "javascript":
      return "JavaScript";
    default:
      return language.toUpperCase();
  }
}

function renderCodebox(content) {
  content = replaceAll(content, "<p><codebox></p>",
    "<div class='codebox'><div class='tab-content'>");
  content = replaceAll(content, "<p></codebox></p>", "</div></div>");
  var dummy = $('<div></div>');
  dummy.html(content);
  $(".codebox", dummy).each(function(index) {
      var prepend_toggle = "<ul class='nav nav-tabs codebox-tabgroup'>";
      $(".tab-content", this).children("pre").each(function(i) {
        var language = $("code", this).attr("class").replace("language-", "");
        var locator = language + index.toString();
        var activeClass = "";
        if (i == 0) activeClass = "active";
        prepend_toggle += "<li class='codebox-tab " + activeClass +
          "'><a class='codebox-link' href='#" + locator + "' aria-controls='" + locator +
          "' data-toggle='tab'>" + prettifyLanguage(language) + "</a></li>";
        $(this).addClass("tab-pane codebox-code");
        if (i == 0) $(this).addClass("active");
        $(this).attr("id", locator);
      });
      prepend_toggle += "</ul>";
      $(this).prepend(prepend_toggle);
  });
  return dummy.html();
}
