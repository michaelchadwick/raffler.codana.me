# Raffler

And the winner is...

## Description

Click or tap the button and a cavalcade of pre-loaded names will begin to cycle more and more slowly as it finally comes to a stop, and a single choice is made. That name will then be added to a results list below the *Raffler*, and will not be chosen again if re-run (until a reset, naturally).

### Local Development

To develop locally, a few simple steps need to be taken.

* clone the project to your local computer
`git clone git@github.com:michaelchadwick/raffler.git`
* change into the new directory
`cd raffler`
* install NodeJS dependencies
`npm install`
* build the project files
`gulp build`
* run a local http server
`npm run serve`

Finally, check out [http://localhost:3000](http://localhost:3000) in a browser for your running instance!

To stop the local instance, issue a `Ctrl-C` at the command line where it's running.

### Tech Specs

*Raffler* uses [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) to keep data and options stateful, even in the event of a browser reload or crash.

*Raffler's* initial data set comes from `assets/json/raffler_data.json` (filename can be changed in `assets/js/app/init.js`), and it is structured as follows:

```json
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

You can optionally add additional items on the fly (this functionality is hidden by default, however) by using the admin menu (`?admin=1` in querystring). The admin menu will also allow you to stop and start a raffler in-process, re-initialize all data, as well as toggle special effects.

### User Options

There are four options that can be changed via flag and an additional config file.

* `dataFilePath` - json file of Raffler items
* `logoFilePath` - logo for your thingy
* `logoFileLink` - click logo and go somewhere
* `talkifyKey` - API key for your [Talkify](https://manage.talkify.net) account (note: you must get a Talkify API key in order to have Raffler honor the "SOUND: NAME" option, which reads names as they are picked)

Here's how you make Raffler use your stuff

* `assets/js/app/init.js` - change the value in line `Raffler.userOptionsMerge = false` to `true`
* copy `assets/js/app/raffler_user_options.dist` to `assets/js/app/raffler_user_options.json` and fill in your specific information

```json
{
  "dataFilePath": "./assets/json/floobidy-hoo.json",
  "logoFilePath": "./assets/images/jamma-mamma.png",
  "logoFileLink": "http://ohmanwhat.omg",
  "talkifyKey": "123456ABCDEF"
}
```

#### Third-Party Help

* [Javascript Standard Style Guide](https://github.com/standard/standard)
* [JS File Saving](https://github.com/eligrey/FileSaver.js)
* [CSV to JSON](https://github.com/Keyang/node-csvtojson)
* [Gulp](https://gulpjs.com)
* [Talkify](https://talkify.net)

#### Attribution

* Countdown sound &copy; [Comedy Central/The Daily Show](https://cc.com)
* Victory sound &copy; [320655__rhodesmas__level-up-01.mp3](http://freesound.org/people/shinephoenixstormcrow/sounds/337049/)
