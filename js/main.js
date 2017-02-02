$(function() {
  // global variables
  var itemsArr = [];
  var initItemsObj = { "items": [] }
  var initInterval = 25;
  var initMult = 1;
  var lastItemChosen = "";
  var timesRun = 0;
  var lastInterval = 359;
  var hasLSSupport = true;

  // elements to mangle
  var $btnToggleAdminMenu = $('.toggle-button');
  var $menuWrap = $('.menu-wrap');
  var $canvasFireworks = $("canvas");
  var $itemsDiv = $("section#items");
  var $resultsDiv = $("section#results");
  var $resultsContent = $("section#results div ul");
  var $ckOptSound = $("input#ckOptSound");
  var $ckOptFireworks = $("input#ckOptFireworks");
  var $infoBubble = $("#item-status-bubble");
  var $btnRaffle = $("a#btnRaffle");
  var $btnStartTimer = $("a#btnStartTimer");
  var $btnStopTimer = $("a#btnStopTimer");
  var $btnResetData = $("a#btnResetData");
  var $inputAddUserItem = $("#text-add-user-item");
  var $btnAddUserItem = $("#btnAddUserItem");
  var $btnClearUserItems = $("#btnClearUserItems");
  var $textAvailableItems = $("#availableItems textarea");
  var $textChosenItems = $("#chosenItems textarea");
  var $divUserItems = $("#user-items");

  var deviceDomain = navigator.userAgent.indexOf("Android") > 1 ? "google" : "apple";

  // jQuery extension to show status messages
  $.fn.statusShow = function(msg, msDelay) {
    if (!msDelay) msDelay = 1000;
    this.hide();
    this.html(msg).slideDown(100).delay(msDelay).slideUp(100);
  }
  // jQuery extension to parse url querystring
  $.QueryString = (function(a) {
    if (a == "") return {};
    var b = {};
    for (var i = 0; i < a.length; ++i)
    {
      var p=a[i].split('=', 2);
      if (p.length != 2) continue;
      b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
    }
    return b;
  })(window.location.search.substr(1).split('&'));
  // if admin passed, show hamburger menu
  if (typeof $.QueryString['admin'] !== "undefined" || true) {
    $('.toggle-button').show();
  }

  // app entry point
  function initApp() {
    checkForLS();
    setEventHandlers();
    resetApp();
    
    if (getLSItem("rafflerUserItems").items.length > 0 && hasLSSupport) {
      $btnClearUserItems.prop("disabled", false);
      $btnClearUserItems.removeClass();
    }
    $btnRaffle.focus();
  }
  // check for localStorage support
  function checkForLS() {
    // if we got LS or SS, then set up the user items UI
    var LSsupport = !(typeof window.localStorage == 'undefined');
    var SSsupport = !(typeof window.sessionStorage == 'undefined');
    if (!LSsupport && !SSsupport) {
      hasLSSupport = false;
      notify("No localStorage or sessionStorage support, so no user items or saving of chosen items. Please don't reload!", "failure");
    } else {
      // if our specific keys don't exist, then init
      if (!localStorage.getItem("rafflerUserItems")) {
        setLSItem("rafflerUserItems", initItemsObj);
      }
      if (!localStorage.getItem("rafflerChosenItems")) {
        setLSItem("rafflerChosenItems", initItemsObj);
      } else {
        syncChosenItemsToItemsArr();
      }
    }
  }
  function setEventHandlers() {
    $btnToggleAdminMenu.on('click', function() {
      $(this).toggleClass('button-open');
      $menuWrap.toggleClass('menu-show');
    });
    $btnRaffle.click(function(e) {
      e.preventDefault();
      if (!$btnRaffle.prop("disabled")) {
        pickOne();
      }
    });
    $btnStartTimer.click(function(e) {
      e.preventDefault();
      countdownTimer.start();
    });
    $btnStopTimer.click(function(e) {
      e.preventDefault();
      countdownTimer.stop();
    });
    $btnResetData.click(function(e) {
      e.preventDefault();
      $("#resetDataDialog").dialog({
        autoOpen: false,
        modal: true,
        resizeable: false,
        height: "auto",
        buttons: {
          "Reset it!" : function() {
            resetCountdown();
            $(this).dialog("close");
          },
          "Nevermind." : function() {
            $(this).dialog("close");
          }
        }
      });

      $("#resetDataDialog").dialog("open");
    });
    $inputAddUserItem.keyup(function(e) {
      var code = e.which;
      if (code == 13) {
        e.preventDefault();
        $btnAddUserItem.click();
      }
    });
    $btnAddUserItem.click(function() {
      if ($inputAddUserItem.val() !== "" || $inputAddUserItem.val() !== undefined) {
        var $newUserItem = $inputAddUserItem.val().trim();

        if ($newUserItem !== "") {
          var tempUserItemObj = getLSItem("rafflerUserItems");
          var newPickAdded = false;

          // if someone adds a list of things, turn into array and then push
          if ($newUserItem.indexOf(',') > -1) {
            $.each($newUserItem.split(','), function(key, val) {
              if (!isDuplicateValue(val)) {
                tempUserItemObj.items.push(sanitize(val));
                newPickAdded = true;
                $btnClearUserItems.prop("disabled", false);
                $btnClearUserItems.removeClass();
              } else {
                notify("<strong>" + val + "</strong> not added: duplicate.", "failure");
              }
            });
          } else {
            // else push single new item onto temp tempUserItemObj
            if (!isDuplicateValue($newUserItem)) {
              tempUserItemObj.items.push(sanitize($newUserItem));
              newPickAdded = true
              $btnClearUserItems.prop("disabled", false);
              $btnClearUserItems.removeClass();
            } else {
              notify("<strong>" + $newUserItem + "</strong> not added: duplicate.", "failure");
            }
          }

          if (newPickAdded) {
            // update localStorage with temp tempUserItemObj
            setLSItem("rafflerUserItems", tempUserItemObj);
            // show status bubble
            notify("<strong>" + $newUserItem + "</strong> added!", "success");
            updateUserItemsDisplay();
          }
        }
      }
    });
    $btnClearUserItems.click(function(e) {
      e.preventDefault();
      if (getLSItem("rafflerUserItems").items.length > 0) {
        $btnClearUserItems.prop("disabled", false);
        $btnClearUserItems.removeClass();

        $("#clearUserItemsDialog").dialog({
          autoOpen: false,
          modal: true,
          resizeable: false,
          height: "auto",
          buttons: {
            "Clear them!" : function() {
              resetUserItems();
              initItemsArr();
              
              $inputAddUserItem.val("");
              
              $btnClearUserItems.prop("disabled", true);
              $btnClearUserItems.addClass("disabled");

              notify("User items cleared", "success");

              $(this).dialog("close");
            },
            "Nevermind." : function() {
              $(this).dialog("close");
            }
          }
        });

        $("#clearUserItemsDialog").dialog("open");
      }
    });
  }
  function resetApp() {
    initItemsArr();
    syncUserItemsToItemsArr();
    syncChosenItemsToItemsArr();
    updateUserItemsDisplay();
    lastItemChosen = "";
  }
  

  // init/reset itemsArr with server json
  function initItemsArr() {
    itemsArr.length = 0; // clear global itemsArr
    $.getJSON("json/raffler-initial.json", function(data) {
      $.each(data.items, function(key, val) {
        itemsArr.push(val);
        $textAvailableItems.append(val + "\n");
      });
    });
  };
  // add user items to main items array
  function syncUserItemsToItemsArr() {
    $inputAddUserItem.text("");
    if(getLSItem("rafflerUserItems").items.length > 0 && hasLSSupport) {
      $.each(getLSItem("rafflerUserItems").items, function(key, val) {
        if (itemsArr.indexOf(val) < 0) {
          itemsArr.push(val);
        }
      });
    }
  }
  // remove chosen items from main items array if we've already used raffler
  function syncChosenItemsToItemsArr() {
    var chosenItemIndex = -1;
    var chosenItems = getLSItem("rafflerChosenItems").items;

    if(chosenItems.length > 0) {

      console.log("itemsArr.length", itemsArr.length);

      $.each(chosenItems, function(chosenItemKey, chosenItemVal) {
        // iterate over itemsArr as array
        for(var i=0; i<itemsArr.length; i++) {
          console.log("itemsArr[]", itemsArr[i]);
        }
        // iterate over itemsArr as object
        for(var itemsArrKey in itemsArr) {
          console.log("itemsArrKey", itemsArrKey);
          if (itemsArr.hasOwnProperty(itemsArrKey)) {
            console.log(itemsArrKey + " -> " + itemsArr(itemsArrKey));
          } else {
            console.log("no itemsArr key by that name");
          }
        }
        if (chosenItemIndex >= 0) {
          itemsArr.splice(chosenItemIndex, 1);
          $textAvailableItems.append(chosenItemVal + "\n");
          $resultsContent.append("<li>" + lastItemChosen + "</li>");
          $resultsDiv.show();
        }
        console.log("itemsArr post", itemsArr);
      });

    }
  }

  function resetChosenItems() {
    setLSItem("rafflerChosenItems", initItemsObj);
    updateChosenItemsDisplay();
  }
  function resetUserItems() {
    setLSItem("rafflerUserItems", initItemsObj);
    updateUserItemsDisplay();
  }

  // update user items div
  function updateUserItemsDisplay() {
    var lsUserItems = getLSItem("rafflerUserItems").items;
    if (lsUserItems) {
      if(lsUserItems.length > 0) {
        $divUserItems.html("<span class='heading'>user items</span>: ");
        $divUserItems.append(lsUserItems.join(', '));
      } else {
        $divUserItems.html("");
      }
    } else {
      $divUserItems.html("");
    }
  }
  // update chosen items public div and admin textarea
  function updateChosenItemsDisplay() {
    var lsChosenItems = getLSItem("rafflerChosenItems").items;
    if (lsChosenItems) {
      if(lsChosenItems.length > 0) {
        $textChosenItems.text("");
        for(var item in lsChosenItems) {
          $textChosenItems.append(item + "\n");
        }
      } else {
        $textChosenItems.text("");
      }
    } else {
      $textChosenItems.text("");
    }
  }
  // update LS chosen items
  function updateChosenItemsLS(item) {
    var tempChosenItemsObj = getLSItem("rafflerChosenItems");
    tempChosenItemsObj.items.push(sanitize(item));
    setLSItem("rafflerChosenItems", tempChosenItemsObj);
  }

  // timer object to keep track of countdown
  window.setVariableInterval = function(callbackFunc, timing) {
    var variableInterval = {
      mult: initMult,
      stage: 0,
      items: itemsArr,
      interval: timing,
      callback: callbackFunc,
      stopped: false,
      startCountdown: false,
      itemsIndex: Math.floor(Math.random() * itemsArr.length),
      runLoop: function() {
        if (variableInterval.stopped) return;
        var result = variableInterval.callback.call(variableInterval);
        if (typeof result == 'number')
        {
          if (result === 0) return;
          variableInterval.interval = result;
        }
        // switch to next item if countdown not done
        if (variableInterval.stage != 4)
          $itemsDiv.html("<span>" + variableInterval.items[variableInterval.itemsIndex++] + "</span>");
        if (variableInterval.itemsIndex == variableInterval.items.length) variableInterval.itemsIndex = 0;
        // loop
        if (variableInterval.stage != 4)
          variableInterval.loop();
      },
      stop: function() {
        this.stopped = true;
        window.clearTimeout(this.timeout);
      },
      start: function() {
        this.stopped = false;
        return this.loop();
      },
      loop: function() {
        this.timeout = window.setTimeout(this.runLoop, this.interval);
        return this;
      }
    };

    return variableInterval.start();
  };

  // main timer for raffler cycler
  var countdownTimer = setVariableInterval(function() {
    // this is the variableInterval - so we can change/get the interval here:
    var interval = this.interval;

    // slow down at a certain point
    if (this.interval > 150 &&
        this.interval <= 250) {
      this.stage = 2;
      $itemsDiv.removeClass();
      $itemsDiv.addClass('level2');
    }

    // slow down more at a certain point
    if (this.interval > 250 &&
        this.interval <= 325) {
      this.stage = 3;
      $itemsDiv.removeClass();
      $itemsDiv.addClass('level3');
    }

    // stop and pick an item!
    if (this.interval > 325) {
      this.mult = initMult;
      if (this.interval > 350) this.mult = this.mult++;
      // adjust for odd time drift
      if (timesRun > 0) lastInterval = 349;
      if (this.interval >= lastInterval) {
        this.stage = 4;
        this.stop();
        this.startCountdown = false;

        lastItemChosen = $itemsDiv.text();
        $itemsDiv.removeClass();
        $itemsDiv.addClass('level4');

        playSound("victory");

        // add to results div
        $resultsContent.append("<li>" + lastItemChosen + "</li>");
        updateChosenItemsLS(lastItemChosen);
        $resultsDiv.show();
        // show fireworks
        displayFireworks();

        timesRun++;
        // add to admin list of chosen items
        $textChosenItems.append(lastItemChosen + "\n");
        // remove last chosen item from itemsArr if anything picked
        if (lastItemChosen !== "") {
          var i = itemsArr.indexOf(lastItemChosen);
          if (i != -1) {
            itemsArr.splice(i, 1);
          }
        }
        // update admin serverItems
        $textAvailableItems.text("");
        itemsArr.forEach(function(item) {
          $textAvailableItems.append(item + "\n");
        });
        
        // re-enable raffle button
        enableRaffle();
      } else {
        return interval + this.mult;
      }
    }

    // start countdown!
    if (this.startCountdown &&
        (this.stage == 0 || this.stage == 1)) {
      this.stage = 1;
      if (!$itemsDiv.hasClass('level1'))
        $itemsDiv.addClass('level1');

      playSound("beep");
    }
    // if we've started countdown
    // and we haven't reached end
    // then keep cycling with increased multiplier
    if (this.stage > 0 && this.stage != 4) {
      return interval + (1.5 ^ this.mult++);
    }
  }, initInterval);

  // you hit the big raffle button
  function pickOne() {
    hideFireworks();
    // disable button until countdown done
    disableRaffle();

    // if we got more than 1 item,
    // then we can raffle
    if (itemsArr.length > 1) {
      $itemsDiv.removeClass();
      countdownTimer.startCountdown = true;
      countdownTimer.interval = initInterval;
      // start new cycle at random spot
      countdownTimer.itemsIndex = Math.floor(Math.random() * itemsArr.length);
      countdownTimer.mult = 1;
      countdownTimer.stage = 1;
      countdownTimer.start();
    } else if (itemsArr.length == 1) {
      $itemsDiv.html("<span>" + itemsArr[0] + "</span>");
      $resultsContent.append($itemsDiv.text());
      notify("Only one item to raffle!<br /><strong>instant winner!</strong>", "warning");
    } else {
      $itemsDiv.html("<span>:'(</span>");
      notify("Nothing to raffle!<br /><strong>Please advise the admin!</strong>", "failure");
    }
  };

  // you hit the reset button
  // puts everyone back in raffle
  // resets stuff, as if you reloaded page
  function resetCountdown() {
    resetApp();
    resetChosenItems();
    $itemsDiv.removeClass();
    $resultsContent.text("");
    $textAvailableItems.text("");
    $resultsDiv.hide();
    countdownTimer.startCountdown = false;
    countdownTimer.interval = initInterval;
    countdownTimer.mult = initMult;
    countdownTimer.stage = 0;
    countdownTimer.start();
  }

  function disableRaffle() {
    $btnRaffle.addClass("disabled");
    $btnRaffle.prop("disabled", true);
  }
  function enableRaffle() {
    $btnRaffle.removeClass("disabled");
    $btnRaffle.prop("disabled", false);
  }
  function hideFireworks() {
    $("#wrapper").prop("z-index", 0);
    $itemsDiv.prop("z-index", 0);
    $btnRaffle.prop("z-index", 0);
    $canvasFireworks.hide();
  }
  function displayFireworks() {
    if ($ckOptFireworks.is(":checked")) {
      $itemsDiv.prop("z-index", 1000);
      $btnRaffle.prop("z-index", 1000);
      $canvasFireworks.prop("z-index", 999);
      $canvasFireworks.show();
    }
  }

  // encode user entries html
  function sanitize(s) {
    return s.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
  }
  // check for duplicate user entries
  function isDuplicateValue(newUserItem) {
    $curPicks = getLSItem("rafflerUserItems");
    var dupeFound = false;

    $.each($curPicks.items, function(key, val) {
      if (newUserItem == val) {
        dupeFound = true;
        return false;
      }
    });

    return dupeFound;
  }
  // get querystring
  function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
      hash = hashes[i].split('=');
      vars.push(hash[0]);
      vars[hash[0]] = hash[1];
    }
    return vars;
  }
  // localStorage getter/setter
  function getLSItem(lsKey) {
    return JSON.parse(localStorage.getItem(lsKey));
  }
  function setLSItem(lsKey, obj) {
    localStorage.setItem(lsKey, JSON.stringify(obj));
  }
  // app notifications
  function notify(msg, type) {
    var bgColor = "#fff";
    var speed = 1500;
    switch ($type) {
      case "success":
        bgColor = "#847E04";
        speed = 1500;
        break;
      case "warning":
        bgColor = "";
        speed = 3000;
        break;
      case "failure":
        bgColor = "#880000";
        speed = 5000;
        break;
      default:
        bgColor = "#fff";
        speed = 1500;
        break;
    }
    $infoBubble.css("background-color", bgColor).statusShow("<span>" + msg + "</span>", speed);
  }
  function playSound(soundId) {
    if ($ckOptSound.is(":checked"))
      document.getElementById(soundId).play();
  }

  /***********************
    START IT UP!!!!!!!!
  ************************/
  initApp();
});
