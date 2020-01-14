window.doppler = (function() {
  var AuContext = (window.AudioContext ||
                   window.webkitAudioContext ||
                   window.mozAudioContext ||
                   window.oAudioContext ||
                   window.msAudioContext);

  var ctx = new AuContext();
  var osc = ctx.createOscillator();

  // This is just preliminary, we'll actually do a quick scan
  // (as suggested in the paper) to optimize this.
  var freq = 20000;

  // See paper for this particular choice of frequencies
  var relevantFreqWindow = 33;

  var getBandwidth = function(analyser, freqs) {
    var primaryTone = freqToIndex(analyser, freq);
    var primaryVolume = freqs[primaryTone];
    // This ratio is totally empirical (aka trial-and-error).
    var maxVolumeRatio = 0.001;

    var leftBw = 0;
    do {
      leftBw++;
      var volume = freqs[primaryTone-leftBw];
      var normalizedVolume = volume / primaryVolume;
    } while (normalizedVolume > maxVolumeRatio && leftBw < relevantFreqWindow);

    var rightBw = 0;
    do {
      rightBw++;
      var volume = freqs[primaryTone+rightBw];
      var normalizedVolume = volume / primaryVolume;
    } while (normalizedVolume > maxVolumeRatio && rightBw < relevantFreqWindow);

    return {
      left: leftBw,
      right: rightBw,
      diff: rightBw - leftBw,
      magnitude: Math.abs(rightBw - leftBw),
      energy: Math.pow(rightBw - leftBw, 2)
     };
  };

  var freqToIndex = function(analyser, freq) {
    var nyquist = ctx.sampleRate / 2;
    return Math.round( freq/nyquist * analyser.fftSize/2 );
  };

  var indexToFreq = function(analyser, index) {
    var nyquist = ctx.sampleRate / 2;
    return nyquist/(analyser.fftSize/2) * index;
  };

  var optimizeFrequency = function(osc, analyser, freqSweepStart, freqSweepEnd) {
    var oldFreq = osc.frequency.value;

    var audioData = new Uint8Array(analyser.frequencyBinCount);
    var maxAmp = 0;
    var maxAmpIndex = 0;

    var from = freqToIndex(analyser, freqSweepStart);
    var to   = freqToIndex(analyser, freqSweepEnd);
    for (var i = from; i < to; i++) {
      // osc.frequency.value = indexToFreq(analyser, i);
      osc.frequency.setValueAtTime(indexToFreq(analyser, i), ctx.currentTime);
      analyser.getByteFrequencyData(audioData);

      if (audioData[i] > maxAmp) {
        maxAmp = audioData[i];
        maxAmpIndex = i;
      }
    }
    // Sometimes the above procedure seems to fail, not sure why.
    // If that happends, just use the old value.
    if (maxAmpIndex == 0) {
      return oldFreq;
    }
    else {
      return indexToFreq(analyser, maxAmpIndex);
    }
  };

  var readMicInterval = 0;
  var readMic = function(analyser, userCallback) {
    var audioData = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(audioData);
    var band = getBandwidth(analyser, audioData);
    userCallback(band);
    readMicInterval = setTimeout(readMic, 1, analyser, userCallback);
  };

  var handleMic = function(stream, callback, userCallback) {
    // Mic
    var mic = ctx.createMediaStreamSource(stream);
    var analyser = ctx.createAnalyser();

    analyser.smoothingTimeConstant = 0.5;
    analyser.fftSize = 2048;

    mic.connect(analyser);

    // Doppler tone
    // osc.frequency.value = freq;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.type = "sine";
    osc.start(ctx.currentTime);
    osc.connect(ctx.destination);

    // There seems to be some initial "warm-up" period
    // where all frequencies are significantly louder.
    // A quick timeout will hopefully decrease that bias effect.
    setTimeout(function() {
      // Optimize doppler tone
      freq = optimizeFrequency(osc, analyser, 19000, 22000);
      // osc.frequency.value = freq;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      console.log('Using base frequency of:', osc.frequency.value, 'Hz');
      clearInterval(readMicInterval);
      callback(analyser, userCallback);
    }, 100);
  };

  return {
    init: function(callback) {
      navigator.getUserMedia_ = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
      navigator.getUserMedia_({ audio: { optional: [{ echoCancellation: false }] } }, function(stream) {
        handleMic(stream, readMic, callback);
      }, function() { console.log('Error!') });
    },
    stop: function () {
      clearInterval(readMicInterval);
    }
  }
})(window, document);
