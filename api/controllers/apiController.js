'use strict';
const mm_music_rnn = require("@magenta/music/node/music_rnn");
const mm_core = require("@magenta/music/node/core");

// find out why tfjs-node doesn't like this model
// require('@tensorflow/tfjs-node');

const globalAny = global;
globalAny.performance = Date;
globalAny.fetch = require('node-fetch');

var drum_rnn_soul = new mm_music_rnn.MusicRNN("http://127.0.0.1:3200/checkpoints/soul");
drum_rnn_soul.initialize();

var drum_rnn_rap = new mm_music_rnn.MusicRNN("http://127.0.0.1:3200/checkpoints/rap");
drum_rnn_rap.initialize();

var drum_rnn_rnb = new mm_music_rnn.MusicRNN("http://127.0.0.1:3200/checkpoints/rnb");
drum_rnn_rnb.initialize();

var drum_rnn_neo_soul = new mm_music_rnn.MusicRNN("http://127.0.0.1:3200/checkpoints/neo-soul");
drum_rnn_neo_soul.initialize();

var improv_rnn = new mm_music_rnn.MusicRNN(
  "https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/chord_pitches_improv"
);
improv_rnn.initialize();

// add chord files !!!
// var chord_progs, chord_json, current_chord_prog;

exports.getPattern = async function(request,resolve) {
  try {
    resolve.json(await updateSequence(request.body));    
  } catch (error) {
    resolve.send(error);
  }
}

async function updateSequence(request) {
  var drum_pattern = [];
  var bass_pattern = [];
  const sequenceInfo = {
    notes: [42],
    quantizationInfo: { stepsPerQuarter: 4 }
  };

  let dream;
  switch (request['musicStyle']) {
    case 'soul':
      dream = await drum_rnn_soul.continueSequence(sequenceInfo, 15, 1.5);
      break;
    case 'rap':
      dream = await drum_rnn_rap.continueSequence(sequenceInfo, 15, 1.5);
      break;
    case 'rnb':
      dream = await drum_rnn_rnb.continueSequence(sequenceInfo, 15, 1.5);
      break;
    case 'neo-soul':
      dream = await drum_rnn_neo_soul.continueSequence(sequenceInfo, 15, 1.5);
      break;
    case undefined:
    case null:
      throw "You must provide a music style. (ex: \"musicStyle: \'rap\'\")"
    default:
      throw "Music style not known";
  }
  
  drum_pattern[0] = {
    note: 36,
    time: "0:0:0"
  };
  for (var i = 0; i < dream.notes.length; i++) {
    var time = "0:0:" + dream.notes[i].quantizedStartStep;
    drum_pattern[i+1] = {
      // TODO: instead of note pitch
      //       return "kick", "snare", etc..
      note: dream.notes[i].pitch,
      time: time
    };
  }

  dream = await improv_rnn.continueSequence(
      buildNoteSequence([{ note: 60, time: 0 }]),
      8,
      1.6,
      ['G', 'C', 'D']
  );
  for (var i = 0; i < dream.notes.length; i++) {
      let startStep = dream.notes[i].quantizedStartStep;
      let time = Math.floor(startStep / 4) +
      ":" + (startStep % 4) + ":0";
      let duration = dream.notes[i].quantizedEndStep - 
      dream.notes[i].quantizedStartStep;

      duration = Math.floor(duration/4) + ":" + duration%4 + ":0";

      bass_pattern[i] = {
      note: dream.notes[i].pitch,
      duration: duration,
      time: time
      };
  }
  return {
    'musicStyle': request['music-style'],
    'drumPattern': drum_pattern,
    'bassPattern' : bass_pattern
  };
}

function buildNoteSequence(seed) {
  return mm_core.sequences.quantizeNoteSequence(
    {
      ticksPerQuarter: 220,
      totalTime: seed.length,
      quantizationInfo: {
        stepsPerQuarter: 1
      },
      timeSignatures: [
        {
          time: 0,
          numerator: 4,
          denominator: 4
        }
      ],
      tempos: [
        {
          time: 0,
          qpm: 70
        }
      ],
      notes: seed.map((n, ntime) => ({
        pitch: n.note,
        startTime: ntime * 1.5,
        endTime: (ntime + 1) * 1.5
      }))
    },
    1
  );
}

