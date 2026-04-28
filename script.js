const audio = document.getElementById("bg-audio"),
  audioToggle = document.getElementById("audio-toggle");
let audioPlaying = false;
document.addEventListener(
  "click",
  function s() {
    audio
      .play()
      .then(() => {
        audioPlaying = true;
        audioToggle.textContent = "🔊";
      })
      .catch(() => {});
  },
  { once: true },
);
audioToggle.addEventListener("click", (e) => {
  e.stopPropagation();
  audioPlaying
    ? (audio.pause(), (audioToggle.textContent = "🔇"), (audioPlaying = false))
    : (audio.play(), (audioToggle.textContent = "🔊"), (audioPlaying = true));
});
window.addEventListener("load", () =>
  setTimeout(
    () => document.getElementById("loader").classList.add("hidden"),
    1500,
  ),
);
const canvas = document.getElementById("wave-canvas"),
  ctx = canvas.getContext("2d");
let W, H;
function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);
const poems = [
  [
    "I wandered lonely as a cloud",
    "That floats on high o'er vales and hills",
    "When all at once I saw a crowd",
    "A host of golden daffodils",
  ],
  [
    "Do not go gentle into that good night",
    "Rage, rage against the dying of the light",
    "Though wise men at their end know dark is right",
    "Because their words had forked no lightning",
  ],
  [
    "Two roads diverged in a yellow wood",
    "And sorry I could not travel both",
    "I took the one less traveled by",
    "And that has made all the difference",
  ],
  [
    "Hold fast to dreams",
    "For if dreams die",
    "Life is a broken-winged bird",
    "That cannot fly",
  ],
  [
    "The fog comes on little cat feet",
    "It sits looking over harbor and city",
    "On silent haunches",
    "And then moves on",
  ],
  [
    "Hope is the thing with feathers",
    "That perches in the soul",
    "And sings the tune without the words",
    "And never stops at all",
  ],
];
let currentPoem = 0,
  currentLine = 0,
  micActive = false,
  micData = new Uint8Array(128),
  analyser = null;
const styles = {
  ocean: {
    colors: ["#0077B6", "#00B4D8", "#90E0EF"],
    speed: 0.02,
    amplitude: 50,
  },
  mountain: {
    colors: ["#588157", "#A3B18A", "#DAD7CD"],
    speed: 0.01,
    amplitude: 80,
  },
  rain: {
    colors: ["#457B9D", "#A8DADC", "#F1FAEE"],
    speed: 0.04,
    amplitude: 30,
  },
  fire: {
    colors: ["#E63946", "#FF6B35", "#FFD700"],
    speed: 0.03,
    amplitude: 60,
  },
};
let currentStyle = "ocean",
  time = 0;
function drawWaves() {
  requestAnimationFrame(drawWaves);
  time += 1;
  ctx.fillStyle = "rgba(15,15,26,0.08)";
  ctx.fillRect(0, 0, W, H);
  const s = styles[currentStyle];
  for (let w = 0; w < 3; w++) {
    ctx.beginPath();
    for (let x = 0; x <= W; x += 3) {
      let amp = s.amplitude * (1 + w * 0.3);
      if (micActive && micData.length > 0) {
        const idx = Math.floor((x / W) * micData.length);
        amp += micData[idx] * 0.3;
      }
      const y =
        H / 2 +
        Math.sin(x * 0.005 + time * s.speed + w * 2) * amp +
        Math.sin(x * 0.01 + time * s.speed * 1.5) * amp * 0.5;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = s.colors[w];
    ctx.lineWidth = 2;
    ctx.shadowColor = s.colors[w];
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
}
drawWaves();
function showLine() {
  const el = document.getElementById("poem-line");
  el.classList.remove("visible");
  setTimeout(() => {
    el.textContent = poems[currentPoem][currentLine];
    el.classList.add("visible");
    currentLine++;
    if (currentLine >= poems[currentPoem].length) {
      currentLine = 0;
      currentPoem = (currentPoem + 1) % poems.length;
    }
  }, 500);
}
showLine();
setInterval(showLine, 5000);
document.getElementById("next-btn").addEventListener("click", (e) => {
  e.stopPropagation();
  showLine();
});
document.getElementById("style-select").addEventListener("change", (e) => {
  currentStyle = e.target.value;
});
document.getElementById("mic-btn").addEventListener("click", async (e) => {
  e.stopPropagation();
  if (micActive) return;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const actx = new AudioContext();
    analyser = actx.createAnalyser();
    analyser.fftSize = 256;
    const source = actx.createMediaStreamSource(stream);
    source.connect(analyser);
    micData = new Uint8Array(analyser.frequencyBinCount);
    micActive = true;
    e.target.textContent = "🎤 Active";
    function readMic() {
      requestAnimationFrame(readMic);
      analyser.getByteFrequencyData(micData);
    }
    readMic();
  } catch (err) {
    e.target.textContent = "🎤 Denied";
  }
});
