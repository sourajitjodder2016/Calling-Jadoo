let sendStrobeTimer = null;
let recvStrobeTimer = null;
let isTransmitting = false;

const KEY_CODES = {
  66: "066", // B
  67: "067", // C
  68: "068", // D
  69: "069", // E
  70: "070"  // F
};

function onLoad() {
  document.addEventListener("keydown", function(e) {
    if (e.keyCode == 13) {
      toggleFullScreen();
    }
  });

  window.addEventListener('keydown', playAudioAndLights);
}

function toggleFullScreen() {
  if (!document.fullscreenElement) {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  }

  document.querySelector('#monitor').style.backgroundColor = "#161913";
  const nodisplays = document.querySelectorAll('.nodisplay');
  nodisplays.forEach(el => el.classList.remove('nodisplay'));

  document.querySelector('.enter-text').classList.add('nodisplay');
  document.querySelector('.background-image').classList.add('nodisplay');

  const promptKey = document.querySelector('.prompt-key');
  promptKey.innerHTML = "B C F E D C D B C F E D C";
}

// লাল-নীল আলো পর্যায়ক্রমে ফ্ল্যাশ করানো
function startStrobe(containerId, isSend) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const red = container.querySelector('.light-red');
  const blue = container.querySelector('.light-blue');

  stopStrobe(containerId, isSend);

  let state = false;
  const timer = setInterval(() => {
    state = !state;
    if (state) {
      red.classList.add('on');
      blue.classList.remove('on');
    } else {
      red.classList.remove('on');
      blue.classList.add('on');
    }
  }, 120);

  if (isSend) sendStrobeTimer = timer;
  else recvStrobeTimer = timer;
}

function stopStrobe(containerId, isSend) {
  if (isSend && sendStrobeTimer) {
    clearInterval(sendStrobeTimer);
    sendStrobeTimer = null;
  } else if (!isSend && recvStrobeTimer) {
    clearInterval(recvStrobeTimer);
    recvStrobeTimer = null;
  }
  const container = document.getElementById(containerId);
  if (container) {
    container.querySelector('.light-red').classList.remove('on');
    container.querySelector('.light-blue').classList.remove('on');
  }
}

// ভিডিওর মতো কী প্রেস হ্যান্ডলিং
function playAudioAndLights(e) {
  const audio = document.querySelector(`audio[data-key="${e.keyCode}"]`);
  if (!audio) return;

  // ১. অডিও প্লে
  audio.currentTime = 0;
  audio.play().catch(() => {});

  // ২. সিগন্যাল কোড আপডেট
  const sig = document.getElementById('sig-val');
  if (sig && KEY_CODES[e.keyCode]) {
    sig.innerText = KEY_CODES[e.keyCode];
  }

  // ৩. SENDING গ্রিড চালু ও বাঁয়ে লাল-নীল আলো শুরু
  const sendDiv = document.getElementById('send');
  sendDiv.style.display = 'flex';
  startStrobe('lights-send', true);

  clearTimeout(window.sendTimeout);
  window.sendTimeout = setTimeout(() => {
    // সেন্ডিং গ্রিড ও আলো বন্ধ
    sendDiv.style.display = 'none';
    stopStrobe('lights-send', true);
    if (sig) sig.innerText = "80 b";

    // ৪. স্পেস থেকে রিসিভ হওয়া (মাঝে মাঝে উত্তর আসবে, মাঝে মাঝে আসবে না)
    triggerReceivingEcho();
  }, 1200);
}

function triggerReceivingEcho() {
  setTimeout(() => {
    // ৬০% সম্ভাবনা উত্তর আসার
    const isReceived = Math.random() > 0.4;

    if (isReceived) {
      const recDiv = document.getElementById('receive');
      recDiv.style.display = 'flex';
      startStrobe('lights-recv', false);

      // স্পেসের উত্তর সাউন্ড
      const audios = Array.from(document.querySelectorAll('audio'));
      const replyAudio = audios[Math.floor(Math.random() * audios.length)];
      if (replyAudio) {
        replyAudio.currentTime = 0;
        replyAudio.play().catch(() => {});
      }

      setTimeout(() => {
        recDiv.style.display = 'none';
        stopStrobe('lights-recv', false);
      }, 1600);
    } else {
      // রিসিভ না হলে কোনো গ্রিড বা আলো আসবে না
      document.getElementById('receive').style.display = 'none';
      stopStrobe('lights-recv', false);
    }
  }, 1800);
}

window.onload = onLoad;