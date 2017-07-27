/* init */
/* get the main app object set up */
/* also define a couple extensions */

var Raffler = {};

// global variables
Raffler.dataFilePath =            "/assets/json/raffler_test2.json";
Raffler.itemsArr =                [];
Raffler.initItemsObj =            [];
Raffler.initInterval =            25;
Raffler.initMult =                1;
Raffler.lastItemChosen =          "";
Raffler.timesRun =                0;
Raffler.lastInterval =            359;
Raffler.hasLocalStorage =         true;

// main divs/elements
Raffler.body =                    $('body');
Raffler.divAdminMenu =            $('div#admin-menu');
Raffler.divMainWrapper =          $('div#wrapper');
Raffler.divItemsCycle =           $('div#items-cycle');
Raffler.divResultsWrapper =       $('div#results-wrapper');
Raffler.divResultsCount =         $('div#results-wrapper h3 span');
Raffler.divResultsContent =       $('div#results-wrapper div ul');
Raffler.divUserItemsManager =     $('div#user-items-manager');
Raffler.divUserItemsDisplay =     $('div#user-items-display');
Raffler.divDataResetDialog =      $('div#data-reset-dialog');
Raffler.divUserItemsClearDialog = $('div#user-items-clear-dialog');
Raffler.divItemStatusBubble =     $('div#item-status-bubble');
Raffler.canvasFireworks =         $('canvas');

// clicky things
Raffler.btnAdminMenuToggle =      $('span#button-admin-menu-toggle');
Raffler.btnRaffle =               $('a#button-raffle');
Raffler.btnTimerStart =           $('a#button-timer-start');
Raffler.btnTimerStop =            $('a#button-timer-stop');
Raffler.btnDataReset =            $('a#button-data-reset');
Raffler.btnUserItemsAdd =         $('button#button-user-items-add');
Raffler.btnUserItemsClear =       $('button#button-user-items-clear');

// audio files
Raffler.sndBeep =                 $('audio#beep');
Raffler.sndVictory =              $('audio#victory');

// optiony things
Raffler.ckOptResize =             $('input#check-option-resize');
Raffler.ckOptSound =              $('input#check-option-sound');
Raffler.ckOptFireworks =          $('input#check-option-fireworks');

// textual input things
Raffler.inputUserItemsAdd =       $('input#text-user-items-add');
Raffler.textAvailableItems =      $('div#items-available textarea');
Raffler.textChosenItems =         $('div#items-chosen textarea');

if (!Raffler.ckOptResize.is(":checked")) {
  Raffler.body.removeClass();
  Raffler.body.addClass("level4");
  Raffler.divItemsCycle.removeClass();
  Raffler.divItemsCycle.addClass("level4");
}

Raffler.sndBeep.attr('src', '/assets/audio/beep1.mp3');
Raffler.sndVictory.attr('src', '/assets/audio/victory.mp3');

// Array extension to make it easier to clear arrays
Array.prototype.clear = function() {
  while (this.length) { this.pop(); }
};

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