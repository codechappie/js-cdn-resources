/**
 * Function scope wrapper.
 */
(function () {
  // region Drawer
  /**
   * An object that holds shapes and current settings
   */
  let drawer = {
    // A list of shapes on the canvas
    shapes: [],
    // If any shapes are undone they are kept here temporarily
    undoneShapes: [],
    // The shape currently selected
    selectedShape: "lineList",
    // Canvas DOM element
    canvas: document.getElementById("canvas"),
    // The context of the canvas
    ctx: document.getElementById("canvas").getContext("2d"),
    // The element currently being drawn
    selectedElement: null,
    // The shapes we can choose from
    availableShapes: {
      RECTANGLE: "rectangle",
      OVAL: "oval",
      CIRCLE: "circle",
      LINE: "line",
      LINE_LIST: "lineList",
      ERASE_LIST: "eraseList",
      DrawnText: "text",
      MOVE: "move", // TODO
    },
    // Settings for selectedElement
    settings: {
      color: "#000000",
      filled: false,
      width: 10,
      font: "36pt sans-serif",
    },
    /**
     * Deep copy of settings.
     *
     * @returns {{color: string, filled: boolean, width: number, font: string}}
     */
    currentSettings: function () {
      return {
        color: drawer.settings.color.slice(0, drawer.settings.color.length),
        filled: drawer.settings.filled,
        width: drawer.settings.width,
        font: drawer.settings.font.slice(0, drawer.settings.font.length),
      };
    },
    currentSettingsEraser: function () {
      return {
        color: drawer.settings.color.slice(0, drawer.settings.color.length),
        filled: drawer.settings.filled,
        width: drawer.settings.width + 10,
        font: drawer.settings.font.slice(0, drawer.settings.font.length),
      };
    },

    /**
     * Draw all stored shapes.
     */
    drawAllStoredShapes: function () {
      for (let i = 0; i < drawer.shapes.length; i++) {
        if (drawer.shapes[i]) {
          drawer.shapes[i].render(drawer.ctx);
        }
      }
    },
    /**
     * Draw the selected shape in its current state.
     */
    drawSelected: function () {
      if (drawer.selectedElement) {
        drawer.selectedElement.render(drawer.ctx);
      }
    },
    /**
     * Redraws all elements to the canvas.
     */
    redraw: function () {
      // Wipe everything off the canvas
      drawer.ctx.canvas.width = window.innerWidth;
      drawer.ctx.canvas.height = window.innerHeight;
      width = canvas.width;
      height = canvas.height;
      drawer.ctx.clearRect(
        0,
        0,
        drawer.ctx.canvas.width,
        drawer.ctx.canvas.height
      );
      drawer.drawAllStoredShapes();
      drawer.drawSelected();
    },
    /**
     * Add the last undone shape back to the list of shapes.
     */
    redo: function () {
      if (drawer.undoneShapes.length > 0) {
        drawer.shapes.push(drawer.undoneShapes.pop());
        drawer.redraw();
      }
    },
    /**
     * Remove the last shape drawn and place in temporary redo storage.
     */
    undo: function () {
      if (drawer.shapes.length > 0) {
        drawer.undoneShapes.push(drawer.shapes.pop());
        drawer.redraw();
      }
    },
  };
  // endregion
  let pos;

  // Set up touch events for mobile, etc
  drawer.canvas.addEventListener(
    "touchstart",
    function (e) {
      mousePos = getTouchPos(canvas, e);
      var touch = e.touches[0];
      var mouseEvent = new MouseEvent("mousedown", {
        clientX: touch.clientX,
        clientY: touch.clientY,
      });
      drawer.canvas.dispatchEvent(mouseEvent);
    },
    false
  );
  drawer.canvas.addEventListener(
    "touchend",
    function (e) {
      var mouseEvent = new MouseEvent("mouseup", {});
      drawer.canvas.dispatchEvent(mouseEvent);
    },
    false
  );
  drawer.canvas.addEventListener(
    "touchmove",
    function (e) {
      var touch = e.touches[0];
      var mouseEvent = new MouseEvent("mousemove", {
        clientX: touch.clientX,
        clientY: touch.clientY,
      });
      drawer.canvas.dispatchEvent(mouseEvent);
    },
    false
  );

  // Get the position of a touch relative to the canvas
  function getTouchPos(canvasDom, touchEvent) {
    var rect = canvasDom.getBoundingClientRect();
    return {
      x: touchEvent.touches[0].clientX - rect.left,
      y: touchEvent.touches[0].clientY - rect.top,
    };
  }

  // region Mouse events
  // region Mouse down
  drawer.canvas.addEventListener(
    "mousedown",
    /**
     * Starts drawing the chosen shape.
     *
     * @param mouseEvent The event that trigger this callback
     */
    function (mouseEvent) {
      pos = { x: mouseEvent.offsetX, y: mouseEvent.offsetY };
      switch (drawer.selectedShape) {
        case drawer.availableShapes.RECTANGLE:
          drawer.selectedElement = new Rectangle(
            pos,
            drawer.currentSettings(),
            0,
            0
          );
          break;
        case drawer.availableShapes.OVAL:
          drawer.selectedElement = new Oval(
            pos,
            drawer.currentSettings(),
            0,
            0
          );
          break;
        case drawer.availableShapes.CIRCLE:
          drawer.selectedElement = new Circle(pos, drawer.currentSettings(), 0);
          break;
        case drawer.availableShapes.LINE:
          drawer.selectedElement = new Line(pos, drawer.currentSettings(), pos);
          break;
        case drawer.availableShapes.LINE_LIST:
          drawer.selectedElement = new LineList(pos, drawer.currentSettings());
          break;
        case drawer.availableShapes.ERASE_LIST:
          drawer.selectedElement = new EraseList(
            pos,
            drawer.currentSettingsEraser()
          );
          break;
        case drawer.availableShapes.DrawnText:
          // If we are already drawing text, store that one
          if (drawer.selectedElement) {
            drawer.shapes.push(drawer.selectedElement);
            drawer.undoneShapes.splice(0, drawer.undoneShapes.length);
          }
          drawer.selectedElement = new DrawnText(pos, drawer.currentSettings());
          break;
        case drawer.availableShapes.MOVE:
          // TODO
          break;
      }
    }
  );
  // endregion

  // region Mouse move
  drawer.canvas.addEventListener(
    "mousemove",
    /**
     * If any shape other than text is being drawn, we resize it.
     *
     * @param mouseEvent The event that trigger this callback
     */
    function (mouseEvent) {
      if (
        drawer.selectedElement &&
        drawer.selectedShape !== drawer.availableShapes.DrawnText
      ) {
        drawer.selectedElement.resize(mouseEvent.offsetX, mouseEvent.offsetY);
        drawer.redraw();
      }
    }
  );
  // endregion

  // region Mouse up
  document.addEventListener(
    "mouseup",
    /**
     * If any element is being drawn and it's not text, then
     * we store it when the mouse is released.
     *
     * @param mouseEvent  The event that trigger this callback
     */
    function (mouseEvent) {
      if (
        drawer.selectedElement &&
        drawer.selectedShape !== drawer.availableShapes.DrawnText
      ) {
        drawer.shapes.push(drawer.selectedElement);
        drawer.selectedElement = null;
        drawer.undoneShapes.splice(0, drawer.undoneShapes.length);
      }
    }
  );
  // endregion
  // endregion

  // region Key events
  /**
   * If we are drawing a text and we press Enter, then
   * we store the text and stop drawing it. Otherwise the
   * key pressed is added to it.
   *
   * @param key A key that was pressed
   */
  function textKeyPress(key) {
    if (key === "Enter") {
      drawer.shapes.push(drawer.selectedElement);
      drawer.selectedElement = null;
      drawer.undoneShapes.splice(0, drawer.undoneShapes.length);
    } else {
      drawer.selectedElement.resize(key);
      drawer.redraw();
    }
  }

  document.addEventListener(
    "keypress",
    /**
     * If a key is pressed, we first check to see if a text
     * is being drawn and if so, handle that accordingly. If
     * not, we check for undo and redo combos.
     *
     * @param evt The event that triggered this callback
     */
    function (evt) {
      if (
        drawer.selectedShape === drawer.availableShapes.DrawnText &&
        drawer.selectedElement
      ) {
        textKeyPress(evt.key);
      } else if (evt.key.toUpperCase() === "Z" && evt.ctrlKey) {
        if (evt.shiftKey) {
          drawer.redo();
        } else {
          drawer.undo();
        }
      }
    }
  );
  // endregion

  document.addEventListener(
    "keydown",
    /**
     * If a key is pressed, we first check to see if a text
     * is being drawn and if so, handle that accordingly. If
     * not, we check for undo and redo combos.
     *
     * @param evt The event that triggered this callback
     */
    function (evt) {
      if (
        drawer.selectedShape === drawer.availableShapes.DrawnText &&
        drawer.selectedElement
      ) {
        let key = evt.key;
        if (key === "Backspace") {
          drawer.selectedElement.resize(key);
          drawer.redraw();
        } else {
          // console.log("borrando")
        }
      }
    }
  );

  // region OnClick events

  // region Undo and Redo
  // Undo and redo can also be done from the navigation bar by clicking icons
  document.getElementById("btn-undo").addEventListener("click", drawer.undo);
  document.getElementById("btn-redo").addEventListener("click", drawer.redo);
  // endregion

  // region Select element
  // Add click events to the shape part of our navigation bar
  document.querySelectorAll("#shape-list li").forEach(
    /**
     * Foreach function that is applied to all elements from the query selector.
     *
     * @param elem The current element of the query selector
     */
    function (elem) {
      elem.addEventListener(
        "click",
        /**
         * If the shape is changed, we begin by checking to see
         * if the previous one was a text and if so, store it as is.
         * Then we change the selected shape and toggle the DOM element
         * class list for the class active, for both the previously selected
         * DOM and the new one.
         *
         * @param evt The event that triggered this callback
         */
        function (evt) {
          if (filled.dataset["filled"] === "no") {
            drawer.settings.filled = false;
          }
          let clickedShape = elem.dataset.shape;
          if (clickedShape === drawer.availableShapes.DrawnText) {
            drawer.settings.filled = true;
            drawer.shapes.push(drawer.selectedElement);
            drawer.undoneShapes.splice(0, drawer.undoneShapes.length);
          }
          if (clickedShape !== drawer.selectedShape) {
            drawer.selectedElement = null;
            drawer.selectedShape = clickedShape;

            // document
            //   .querySelectorAll("#shape-list li.active")[0]
            //   .classList.toggle("active");
            // elem.classList.toggle("active");
          }
        }
      );
    }
  );
  // endregion

  // region Filled setting
  // On click event for the star (which is either filled or not)
  let filled = document.getElementById("fill-toggle");
  filled.addEventListener(
    "click",
    /**
     * A boolean value for filled is toggled by clicking
     * the star and the glyph is toggled as well, between
     * a filled star and a hollow one.
     *
     * @param evt The event that triggered this callback.
     */
    function (evt) {
      filled.firstElementChild.classList.toggle("far");
      filled.firstElementChild.classList.toggle("fas");
      // filled.classList("active");
      if (filled.dataset["filled"] === "no") {
        filled.dataset["filled"] = "yes";
        drawer.settings.filled = true;
      } else {
        filled.dataset["filled"] = "no";
        drawer.settings.filled = false;
      }
    }
  );
  // endregion

  // region Color picker
  // HTML5 color picker, black by default
  // let colorPicker = document.getElementById("color-selector");
  // colorPicker.value = "#000000";

  let colorPicker = "#000000";

  const chooseColor = document.querySelectorAll("#color-selector li a");

  chooseColor.forEach((element) => {
    element.addEventListener("click", (chooseColor) => {
      let currentColor = chooseColor.target.classList.value;

      let navItems = chooseColor.target.parentNode.parentNode.childNodes;

      navItems.forEach((navItem) => {
        if (
          navItem.children[0].classList.length > 1 &&
          navItem.children[0].classList[0] !== currentColor
        ) {
          navItem.children[0].classList.remove("selected");
        }
      });

      chooseColor.target.classList.add("selected");

      if (currentColor === "red-color") {
        drawer.settings.color = "#FF0000";
      } else if (currentColor === "orange-color") {
        drawer.settings.color = "#FFA500";
      } else if (currentColor === "yellow-color") {
        drawer.settings.color = "#FFFF00";
      } else if (currentColor === "light-green-color") {
        drawer.settings.color = "#00FF00";
      } else if (currentColor === "dark-green-color") {
        drawer.settings.color = "#008000";
      } else if (currentColor === "sky-blue-color") {
        drawer.settings.color = "#87ceeb";
      } else if (currentColor === "blue-color") {
        drawer.settings.color = "#0000ff";
      } else if (currentColor === "purple-color") {
        drawer.settings.color = "#800080";
      } else if (currentColor === "fuxia-color") {
        drawer.settings.color = "#ff00ff";
      } else if (currentColor === "brown-color") {
        drawer.settings.color = "#964B00";
      } else if (currentColor === "pink-color") {
        drawer.settings.color = "#FFC0CB";
      } else if (currentColor === "white-color") {
        drawer.settings.color = "#FFFFFF";
      } else if (currentColor === "black-color") {
        drawer.settings.color = "#000000";
      } else {
        drawer.settings.color = "#000000";
      }
    });
  });

  const chooseTool = document.querySelectorAll("#shape-list li a");

  chooseTool.forEach((elementTool) => {
    elementTool.addEventListener("click", (chooseTool) => {
      let currentTool = chooseTool.target.classList.value;
      let navTools = chooseTool.target.parentNode.parentNode.childNodes;

      navTools.forEach((navItem) => {
        if(navItem.children[0].classList.length > 1 && navItem.children[0].classList[0] !== currentTool){
          console.log("This: ",navItem.children[0].classList);
          navItem.children[0].classList.remove('selected');
        }
      });
     console.log(chooseTool.target)
     chooseTool.target.classList.add('selected');
    });
  });
  // colorPicker.addEventListener(
  //   "change",
  //   /**
  //    * Set the color settings to the chosen color.
  //    *
  //    * @param evt The event that triggered this callback
  //    */
  //   function (evt) {
  //     drawer.settings.color = colorPicker.value;
  //     console.log(colorPicker.value)
  //   }
  // );
  // endregion

  // region Size settings
  // region Line width
  // The DOM elements within the modal belonging to line width
  let widthSetting = document.getElementById("width-row");
  let widthDecrease = widthSetting.querySelectorAll("td > a.decrease")[0];
  let widthIncrease = widthSetting.querySelectorAll("td > a.increase")[0];
  let widthValue = widthSetting.querySelectorAll("td.value-data")[0];
  widthDecrease.addEventListener(
    "click",
    /**
     * Decrease the value of the text node down to a minimum of 1.
     *
     * @param evt The event that triggered this callback
     */
    function (evt) {
      widthValue.innerHTML = Math.max(1, parseInt(widthValue.innerHTML) - 4);
    }
  );
  widthIncrease.addEventListener(
    "click",
    /**
     * Increase the value of the text node up to a maximum of 50.
     *
     * @param evt The event that triggered this callback
     */
    function (evt) {
      widthValue.innerHTML = Math.min(70, parseInt(widthValue.innerHTML) + 4);
    }
  );
  // endregion

  // region Font size
  // The DOM elements within the modal belonging to font size
  let fontSetting = document.getElementById("font-row");
  let fontDecrease = fontSetting.querySelectorAll("td > a.decrease")[0];
  let fontIncrease = fontSetting.querySelectorAll("td > a.increase")[0];
  let fontValue = fontSetting.querySelectorAll("td.value-data")[0];
  fontDecrease.addEventListener(
    "click",
    /**
     * Decrease the value of the text node down to a minimum of 6.
     *
     * @param evt The event that triggered this callback
     */
    function (evt) {
      fontValue.innerHTML = ((s) =>
        Math.max(6, parseInt(s.slice(0, s.length - 2)) - 4) + "pt")(
        fontValue.innerHTML
      );
    }
  );
  fontIncrease.addEventListener(
    "click",
    /**
     * Increase the value of the text node up to a maximum of 42.
     *
     * @param evt The event that triggered this callback
     */
    function (evt) {
      fontValue.innerHTML = ((s) =>
        Math.min(70, parseInt(s.slice(0, s.length - 2)) + 4) + "pt")(
        fontValue.innerHTML
      );
    }
  );
  // endregion

  // region Modal
  let sizeModal = document.getElementById("size-modal");
  // DOM elements that will cancel the changes made to line width and font size
  let sizeAbort = sizeModal.querySelectorAll("button.abort");
  for (let i = 0; i < sizeAbort.length; i++) {
    sizeAbort[i].addEventListener(
      "click",
      /**
       * Change the text nodes back to the value they had
       * when the modal was opened (the actual value is
       * stored in a data set within the node).
       *
       * @param evt The event that triggered this callback
       */
      function (evt) {
        widthValue.innerHTML = widthSetting.dataset["value"];
        fontValue.innerHTML = fontSetting.dataset["value"];
      }
    );
  }
  // The DOM element that will confirm the changes made to line width and font size
  sizeModal.querySelectorAll("button.confirm")[0].addEventListener(
    "click",
    /**
     * Update both the data set containing the actual value
     * and the settings object in our drawer.
     *
     * @param evt The event that triggered this callback
     */
    function (evt) {
      widthSetting.dataset["value"] = widthValue.innerHTML;
      drawer.settings.width = parseInt(widthValue.innerHTML);
      fontSetting.dataset["value"] = fontValue.innerHTML;
      drawer.settings.font =
        fontValue.innerHTML + " " + drawer.settings.font.split(" ")[1];
    }
  );
  // endregion
  // endregion

  const chooseSize = document.querySelectorAll("#size-chooser li a");

  chooseSize.forEach((element) => {
    element.addEventListener("click", (chooseSize) => {
      console.log("clicked size");
      let numSize = parseInt(chooseSize.target.classList);
      drawer.settings.width = numSize;
      console.log(numSize);
    });
  });

  // region New image
  document.getElementById("img-clear").addEventListener(
    "click",
    /**
     * Restart the drawing.
     *
     * @param evt The event that triggered this callback
     */
    function (evt) {
      console.log(evt);
      drawer.selectedElement = null;
      drawer.shapes.splice(0, drawer.shapes.length);
      drawer.undoneShapes.splice(0, drawer.undoneShapes.length);
      drawer.redraw();
    }
  );
  // endregion
  // endregion
  // endregion
})();
