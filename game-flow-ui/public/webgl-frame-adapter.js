(function () {
  function parseAspectRatio(aspectRatio) {
    if (typeof aspectRatio === "number" && aspectRatio > 0) {
      return aspectRatio;
    }

    if (typeof aspectRatio !== "string") {
      return null;
    }

    var parts = aspectRatio.split(/[:/]/).map(function (value) {
      return Number(value.trim());
    });

    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      return null;
    }

    return parts[0] / parts[1];
  }

  function getCanvasAspectRatio(canvas) {
    if (!canvas) {
      return null;
    }

    var width = Number(canvas.getAttribute("width")) || canvas.width || canvas.clientWidth;
    var height = Number(canvas.getAttribute("height")) || canvas.height || canvas.clientHeight;

    if (!width || !height) {
      return null;
    }

    return width / height;
  }

  function applyDocumentStyles(doc) {
    doc.documentElement.style.width = "100%";
    doc.documentElement.style.height = "100%";
    doc.documentElement.style.overflow = "hidden";

    doc.body.style.width = "100%";
    doc.body.style.height = "100%";
    doc.body.style.margin = "0";
    doc.body.style.overflow = "hidden";
  }

  function fitViewport(aspectRatio, viewportWidth, viewportHeight) {
    var width = viewportWidth;
    var height = width / aspectRatio;

    if (height > viewportHeight) {
      height = viewportHeight;
      width = height * aspectRatio;
    }

    return { width: width, height: height };
  }

  function setCenteredPosition(target) {
    target.style.position = "absolute";
    target.style.left = "50%";
    target.style.top = "50%";
    target.style.transform = "translate(-50%, -50%)";
  }

  function setElementSize(target, width, height) {
    target.style.width = width + "px";
    target.style.height = height + "px";
  }

  function queryOptional(selector) {
    return selector ? document.querySelector(selector) : null;
  }

  function getElements(config) {
    var canvas = document.querySelector(config.canvasSelector || "#unity-canvas, canvas");

    if (!canvas) {
      return {};
    }

    var container = queryOptional(config.containerSelector) || document.querySelector("#unity-container") || canvas.parentElement;
    var sizeTarget = queryOptional(config.sizeTargetSelector) || container || canvas;
    var positionTarget = queryOptional(config.positionTargetSelector) || container || sizeTarget;

    return {
      canvas: canvas,
      container: container,
      sizeTarget: sizeTarget,
      positionTarget: positionTarget,
    };
  }

  function attach(userConfig) {
    var config = userConfig || {};
    var elements = getElements(config);
    var canvas = elements.canvas;
    var sizeTarget = elements.sizeTarget;
    var positionTarget = elements.positionTarget;

    if (!canvas || !sizeTarget) {
      return null;
    }

    var aspectRatio = parseAspectRatio(config.aspectRatio) || getCanvasAspectRatio(canvas) || 16 / 9;

    function resize() {
      applyDocumentStyles(document);

      var viewportWidth = window.innerWidth;
      var viewportHeight = window.innerHeight;
      var fittedSize = fitViewport(aspectRatio, viewportWidth, viewportHeight);

      setElementSize(sizeTarget, fittedSize.width, fittedSize.height);

      if (config.scaleCanvasToTarget !== false) {
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.display = "block";
      } else {
        setElementSize(canvas, fittedSize.width, fittedSize.height);
      }

      if (config.centerTarget !== false && positionTarget) {
        setCenteredPosition(positionTarget);
      }

      (config.hideSelectors || []).forEach(function (selector) {
        document.querySelectorAll(selector).forEach(function (element) {
          element.style.display = "none";
        });
      });
    }

    resize();
    window.addEventListener("resize", resize);

    return {
      resize: resize,
      destroy: function destroy() {
        window.removeEventListener("resize", resize);
      },
    };
  }

  window.WebGLFrameAdapter = {
    attach: attach,
  };
})();
