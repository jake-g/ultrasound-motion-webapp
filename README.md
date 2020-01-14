# Ultrasound Motion Detector

Plays ultrasonic (>20k Hz sinusoid) from computer or phone speakers and measures [Doppler shift](https://en.wikipedia.org/w/index.php?title=Doppler_effect&section=2#General) response via microphone. See `ultrasound_doppler.js` for algorithm details, and `plotter.js` for plot configuration.


* [webapp](https://jake-g.github.io/ultrasound-motion-webapp/)
* [original publication](https://ubicomplab.cs.washington.edu/pdfs/soundwave.pdf)
* [original algorithm](https://github.com/DanielRapp/doppler)

### Webapp Options
* **`toggle doppler`**: Toggle the algorithm.
* **`toggle synth`**: Toggle and audible synth to play tones proportional to the motion. Like a [theramin](https://en.wikipedia.org/wiki/Theremin)!
* **`toggle gate`**: Clamps motion to 0 if its magnitude is below a threshold
* **`toggle fullscreen`**: Entry or exit fullscreen browser.

### Theory
![doppler shift equation](http://hyperphysics.phy-astr.gsu.edu/hbase/Sound/imgsou/dopp.gif "Doppler shift hyperphysics")

Motion near (within a few meters) the microphone/speaker will induce a measurable [Doppler shift](https://en.wikipedia.org/w/index.php?title=Doppler_effect&section=2#General) to the emitted source sinusoid. The received sinusoid's change in frequency is proportional to the magnitude of motion. Information about the direction of the motion relative to the speaker/microphone pair can also be extracted based on the sign of the change in frequency. More info in the linked paper.

### Ultrasound Doppler Algorithm
A sinusoid of ultrasonic frequency is emitted via the speakers and received via the microphone. The change in frequency between the emitted sinusoid frequency and the perceived sinusoid is computed in realtime and converted to a unitless motion magnitude using [Doppler shift](https://en.wikipedia.org/w/index.php?title=Doppler_effect&section=2#General) principles


#### Ultrasound Frequency Initialization
The ultrasound sinusoid is initialized by sweeping 19 kHz to 22 kHz and choosing a frequency that has low ambient noise.


### Credits
Algorithm based on [doppler](https://github.com/DanielRapp/doppler) which is pasted on the [research](https://ubicomplab.cs.washington.edu/pdfs/soundwave.pdf) from the Ubicomp lab. The plotting display uses the `smoothie.js` charting [javascript library](http://smoothiecharts.org/). Doppler equation image from [hyperphysics](http://hyperphysics.phy-astr.gsu.edu/hbase/Sound/dopp.html).


