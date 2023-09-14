const video = document.getElementById('video');
var socket = io.connect('http://127.0.0.1:5000');

socket.on('connect', function() {
  console.log("SOCKET CONNECTED");
});

navigator.getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.msGetUserMedia;

Promise.all([
  // Load face detection models from the backend
  faceapi.loadFaceLandmarkModel("http://127.0.0.1:5000/static/models/"),
  faceapi.loadFaceRecognitionModel("http://127.0.0.1:5000/static/models/"),
  faceapi.loadTinyFaceDetectorModel("http://127.0.0.1:5000/static/models/"),
  faceapi.loadFaceLandmarkModel("http://127.0.0.1:5000/static/models/"),
  faceapi.loadFaceLandmarkTinyModel("http://127.0.0.1:5000/static/models/"),
  faceapi.loadFaceRecognitionModel("http://127.0.0.1:5000/static/models/"),
  faceapi.loadFaceExpressionModel("http://127.0.0.1:5000/static/models/"),
])
  .then(startVideo)
  .catch(err => console.error(err));

function startVideo() {
  console.log("access");
  navigator.getUserMedia(
    { video: {} },
    stream => (video.srcObject = stream),
    err => console.error(err)
  );
}

let happyDetected = false;
let happyTimer;
let neutralDetected = false;
let neutralTimer;
let surprisedDetected = false;
let surprisedTimer;
let sadDetected = false;
let sadTimer;
let disgustedDetected = false;
let disgustedTimer;
let angryDetected = false;
let angryTimer;

const thresholds = {
  happy: 0.8,
  neutral: 0.8,
  surprised: 0.8,
  sad: 0.8,
  disgusted: 0.8,
  angry: 0.8,
};

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();

    // Emit face detection data to the backend
    socket.emit('my event', {
      data: detections
    });

    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

    if (hasEmotion('happy', detections)) {
      if (!happyDetected) {
        happyDetected = true;
        happyTimer = setTimeout(() => {
          window.location.href = 'https://oscarfernandass.github.io/happy.web/';
        }, 1500);
      }
    } else if (hasEmotion('neutral', detections)) {
      if (!neutralDetected) {
        neutralDetected = true;
        neutralTimer = setTimeout(() => {
          window.location.href = 'https://oscarfernandass.github.io/bored.web/';
        }, 3500);
      }
    } else if (hasEmotion('surprised', detections)) {
      if (!surprisedDetected) {
        surprisedDetected = true;
        surprisedTimer = setTimeout(() => {
          window.location.href = 'https://oscarfernandass.github.io/surprised.web/';
        }, 2000);
      }
    } else if (hasEmotion('sad', detections)) {
      if (!sadDetected) {
        sadDetected = true;
        sadTimer = setTimeout(() => {
          window.location.href = 'https://oscarfernandass.github.io/sad.web/';
        }, 2000);
      }
    } else if (hasEmotion('disgusted', detections)) {
      if (!disgustedDetected) {
        disgustedDetected = true;
        disgustedTimer = setTimeout(() => {
          window.location.href = 'https://oscarfernandass.github.io/disgusted.web/';
        }, 2000);
      }
    } else if (hasEmotion('angry', detections)) {
      if (!angryDetected) {
        angryDetected = true;
        angryTimer = setTimeout(() => {
          window.location.href = 'https://oscarfernandass.github.io/angry.web/';
        }, 2000);
      }
    } else {
      happyDetected = false;
      neutralDetected = false;
      surprisedDetected = false;
      sadDetected = false;
      disgustedDetected = false;
      angryDetected = false;
      clearTimeout(happyTimer);
      clearTimeout(neutralTimer);
      clearTimeout(surprisedTimer);
      clearTimeout(sadTimer);
      clearTimeout(disgustedTimer);
      clearTimeout(angryTimer);
    }
  }, 100);
});

function hasEmotion(emotion, detections) {
  if (!detections || detections.length === 0) return false;

  const expression = detections[0].expressions[emotion];
  return expression >= thresholds[emotion];
}
// JavaScript to generate additional icons and spread them over the page
const numIcons = 18; // Change this value to control the number of icons
const emojis = ['😇', '🥰', '😚', '😜', '😂', '😀', '🤩', '🤪', '☹️']; // Add more emojis if you like
const iconContainer = document.getElementById('icon-container');

for (let i = 0; i < numIcons; i++) {
  const icon = document.createElement('div');
  icon.className = 'icon';
  icon.innerHTML = emojis[Math.floor(Math.random() * emojis.length)];
  iconContainer.appendChild(icon);

  // Randomly position icons within the viewport
  const left = `${Math.random() * 100}%`;
  const top = `${Math.random() * 100}%`;
  icon.style.left = left;
  icon.style.top = top;

  // Randomly adjust the animation duration for each icon
  const animationDuration = Math.random() * 4 + 2; // Random duration between 2 and 6 seconds
  icon.style.animationDuration = `${animationDuration}s`;
}
