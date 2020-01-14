  // config
  var buffer_size = 30;
  var noise_thresh = 1;

  var plot_conf = {
    "bg_color": '#000000',
    "line_color": '#8663FF',
    "chart_pad": 40
  }

  // TODO make synth class
  var synth_conf = {
    "play": false,
    "gain": 0.2, // 0 to 1
    "glide": 0.2, // ms
    "freq": 220, // hz
    "max_freq": 220 * 6, // hz
    "shape": 'sine',
  }

  function synth_init() {
    synth = ctx.createOscillator();
    gain = ctx.createGain();
    gain.connect(ctx.destination)
    synth.type = synth_conf.shape;
    synth.start(ctx.currentTime);
    if (synth_conf.play) {
      synth_toggle(); // twice to apply toggle
      synth_toggle();
    }
  }

  function synth_toggle() {
    synth_conf.play = !synth_conf.play;
    console.log('play synth', synth_conf.play);
    if (synth_conf.play) {
      synth.frequency.setValueAtTime(synth_conf.freq, ctx.currentTime);
      synth.connect(gain);
      gain.gain.setValueAtTime(synth_conf.gain, ctx.currentTime);
    } else {
      synth.disconnect();
    }
  }

  function fullscreen_toggle() {
    fullscreen = !fullscreen;
    console.log('fullscreen', fullscreen);
    if (fullscreen) {
      document.body.webkitRequestFullscreen();
    } else {
      document.webkitExitFullscreen();
    }
  }

  function doppler_toggle() {
    doppler_on = !doppler_on;
    console.log('doppler on', doppler_on);
    if (doppler_on) { // hacky restart
      window.location.reload();
    } else {
      window.doppler.stop()
    }
  }

  function gate_toggle() {
    gate_on = !gate_on;
    console.log('gate on', gate_on);
  }

  // init /////////////////////////////////////
  // tone
  var AuContext = (window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.oAudioContext || window.msAudioContext);
  var ctx = new AuContext();
  var synth, gain
  var fullscreen = false
  var doppler_on = true
  var gate_on = true

  synth_init()

  // chart
  var smoothie = new SmoothieChart({
    grid: {
      strokeStyle: plot_conf.bg_color,
      fillStyle: plot_conf.bg_color,
      borderVisible: false
    }
  });
  var plot_buffer = new TimeSeries();
  var canvas = document.getElementById('linePlot')
  canvas.width = window.innerWidth - plot_conf.chart_pad;
  canvas.height = window.innerHeight - plot_conf.chart_pad;
  document.body.style.backgroundColor = plot_conf.bg_color;

  smoothie.addTimeSeries(plot_buffer, {
    lineWidth: 2,
    strokeStyle: plot_conf.line_color
  })
  smoothie.streamTo(document.getElementById("linePlot"), 500);

  var _buffer = []
  var counter = 0
  console.log('initialized...')


  // run ////////////////////////////////////////////////
  window.addEventListener('load', function() {
    console.log('buffer size', buffer_size);
    console.log('loaded doppler...')
    window.doppler.init(function(bandwidth) {
      // console.log(bandwidth)
      // var diff = Math.abs(bandwidth.right - bandwidth.left);
      counter += 1;

      _buffer.push(bandwidth.magnitude)

      // Add _buffer average to timeseries
      if (counter % buffer_size == 0) {
        var sum = 0;
        for (var i = 0; i < _buffer.length; i++) {
          sum += _buffer[i]
        }
        var avg = sum / _buffer.length;
        console.log(avg)

        // noise gate

        if (gate_on && avg < noise_thresh) {
          avg = 0;
        }
        plot_buffer.append(new Date().getTime(), avg);
        _buffer = []

        // Play synth
        if (synth_conf.play) {
          var note_scale = 20 * synth_conf.freq / synth_conf.max_freq
          factor = 1 + avg / note_scale
          console.log(factor * synth_conf.freq);
          synth.frequency.linearRampToValueAtTime(
            factor * synth_conf.freq, ctx.currentTime + synth_conf.glide)
        }
      }
    });
  });
