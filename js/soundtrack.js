// ASTRAVERSE — original procedural ambient soundtrack
export function initSoundtrack({ $, toast }) {
// Original procedural soundtrack: soft cosmic pads + delicate bell-like arpeggios.
const soundtrackBtn=$('soundBtn'), uploadMusicBtn=$('uploadMusicBtn'), musicFile=$('musicFile'), audio=$('ambientAudio'), volume=$('musicVolume');
let musicCtx=null,musicMaster=null,musicTimer=null,musicStep=0,musicPlaying=false;
const chordProgression=[
  [261.63,329.63,392.00,493.88],
  [220.00,261.63,329.63,392.00],
  [174.61,220.00,261.63,349.23],
  [196.00,246.94,293.66,392.00]
];
function bellTone(freq,when,duration=2.8){
  const osc=musicCtx.createOscillator(), overtone=musicCtx.createOscillator(), gain=musicCtx.createGain();
  const shimmer=musicCtx.createGain();
  osc.type='sine';osc.frequency.setValueAtTime(freq,when);
  overtone.type='sine';overtone.frequency.setValueAtTime(freq*2.01,when);
  shimmer.gain.value=.16;gain.gain.setValueAtTime(.0001,when);
  gain.gain.exponentialRampToValueAtTime(.12,when+.035);
  gain.gain.exponentialRampToValueAtTime(.0001,when+duration);
  osc.connect(gain);overtone.connect(shimmer);shimmer.connect(gain);gain.connect(musicMaster);
  osc.start(when);overtone.start(when);osc.stop(when+duration+.1);overtone.stop(when+duration+.1);
}
function softPad(freq,when,duration=7){
  const filter=musicCtx.createBiquadFilter(),gain=musicCtx.createGain();
  filter.type='lowpass';filter.frequency.value=900;filter.Q.value=.5;
  gain.gain.setValueAtTime(.0001,when);gain.gain.linearRampToValueAtTime(.027,when+1.8);
  gain.gain.setTargetAtTime(.0001,when+duration-1.3,.8);
  [1,.997].forEach((ratio,i)=>{
    const osc=musicCtx.createOscillator();osc.type='triangle';osc.frequency.value=freq*ratio;
    const voiceGain=musicCtx.createGain();voiceGain.gain.value=i?.42:.58;
    osc.connect(voiceGain);voiceGain.connect(filter);osc.start(when);osc.stop(when+duration);
  });
  filter.connect(gain);gain.connect(musicMaster);
}
function soundtrackTick(){
  if(!musicCtx||!musicPlaying)return;
  const now=musicCtx.currentTime+.08, chord=chordProgression[Math.floor(musicStep/8)%chordProgression.length];
  if(musicStep%8===0)chord.forEach((f,i)=>softPad(f/2,now+i*.12,7.7));
  const melody=[0,2,1,3,2,1,3,2, 1,3,2,0,2,3,1,2];
  const note=chord[melody[musicStep%melody.length]]*(musicStep%4===3?2:1);
  bellTone(note,now,2.5);
  if(musicStep%4===2)bellTone(chord[(musicStep+1)%4]*2,now+.32,2.1);
  musicStep++;
}
async function toggleSoundtrack(){
  if(musicPlaying){
    musicPlaying=false;clearInterval(musicTimer);musicMaster.gain.setTargetAtTime(.0001,musicCtx.currentTime,.35);
    soundtrackBtn.textContent='♫ Play soundtrack';return;
  }
  const AudioContextClass=window.AudioContext||window.webkitAudioContext;
  if(!AudioContextClass){toast('This browser does not support the soundtrack audio engine.');return;}
  if(!musicCtx){
    musicCtx=new AudioContextClass();musicMaster=musicCtx.createGain();musicMaster.gain.value=0;
    const compressor=musicCtx.createDynamicsCompressor();compressor.threshold.value=-22;compressor.knee.value=18;compressor.ratio.value=3;
    musicMaster.connect(compressor);compressor.connect(musicCtx.destination);
  }
  await musicCtx.resume();musicPlaying=true;
  musicMaster.gain.setTargetAtTime(Number(volume.value)/100*.72,musicCtx.currentTime,.8);
  soundtrackBtn.textContent='♫ Pause soundtrack';soundtrackTick();musicTimer=setInterval(soundtrackTick,1250);
}
soundtrackBtn.addEventListener('click',toggleSoundtrack);
uploadMusicBtn.addEventListener('click',()=>musicFile.click());
volume.addEventListener('input',()=>{
  const v=Number(volume.value)/100;audio.volume=v;
  if(musicMaster&&musicPlaying)musicMaster.gain.setTargetAtTime(v*.72,musicCtx.currentTime,.15);
});


}
