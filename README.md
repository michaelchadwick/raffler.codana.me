# Raffler

### Description
Click or tap the button and a cavalcade of pre-loaded names will begin to cycle more and more slowly as it finally comes to a stop, and a single choice is made. That name will then be added to a results list below the *Raffler*, and will not be chosen again if re-run (until a reset, naturally).

### Tech Specs
*Raffler* uses [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) to keep everything stateful, even in the event of a browser reload or crash.

*Raffler's* initial data set comes from `/json/raffler_data.json` (filename can be changed in `/js/app/init.js`), and it is structured as follows:

```
[
  {
    "name": "Bavmorda",
    "affl": "Nockmaar"
  },
  {
    "name": "Elora Danan",
    "affl": "Tir Asleen"
  },
  {
    "name": "Madmartigan",
    "affl": "Crossroads"
  },
  {
    "name": "Sorsha",
    "affl": "Nockmaar"
  },
  {
    "name": "Willow Ufgood",
    "affl": "Newlyn"
  }
]
```
You can optionally add additional items on the fly (this functionality is hidden by default, however) by using the admin menu (`?admin=1` in querystring). The admin menu will also allow you to stop and start a raffler in-process, re-initialize all data, as well as toggle sound and visual effects.

The logo next to the main Raffler logo can be changed by change the image at `/assets/images/logo.png`. Keep it under 200px so it still looks OK on mobile.

### Third-Party Help
* [Javascript Standard Style Guide](https://github.com/standard/standard)
* [JS File Saving](https://github.com/eligrey/FileSaver.js)
* [CSV to JSON](https://github.com/Keyang/node-csvtojson)
* [Grunt](https://github.com/gruntjs/grunt)
