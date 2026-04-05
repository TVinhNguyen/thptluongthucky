(function () {
  function getExpectedContainer(fileInput) {
    if (!fileInput) {
      return null;
    }

    var container = fileInput.parentNode;
    if (container) container = container.parentNode;
    if (container) container = container.parentNode;
    return container || null;
  }

  function ensureFallbackPlaceholder(fileInput) {
    if (!fileInput) {
      return;
    }

    var container = getExpectedContainer(fileInput);
    if (!container) {
      return;
    }

    if (container.querySelector("input[type='text']")) {
      return;
    }

    var fallback = document.createElement("input");
    fallback.type = "text";
    fallback.style.display = "none";
    fallback.tabIndex = -1;
    fallback.setAttribute("aria-hidden", "true");
    fallback.className = "unfold-file-input-fallback";
    container.appendChild(fallback);
  }

  function scan(root) {
    var scope = root || document;
    var inputs = scope.querySelectorAll("input[type='file']");
    for (var i = 0; i < inputs.length; i += 1) {
      ensureFallbackPlaceholder(inputs[i]);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    scan(document);

    // Ensure placeholder exists before Unfold's own input change handler runs.
    document.addEventListener(
      "change",
      function (event) {
        var target = event.target;
        if (!target || !target.matches || !target.matches("input[type='file']")) {
          return;
        }
        ensureFallbackPlaceholder(target);
      },
      true
    );

    var observer = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i += 1) {
        var addedNodes = mutations[i].addedNodes;
        for (var j = 0; j < addedNodes.length; j += 1) {
          var node = addedNodes[j];
          if (!node || node.nodeType !== 1) {
            continue;
          }

          if (node.matches && node.matches("input[type='file']")) {
            ensureFallbackPlaceholder(node);
          } else if (node.querySelectorAll) {
            scan(node);
          }
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  });
})();
