'use strict';

let video = document.getElementById('video');
let canvas_in = document.getElementById('canvas_in');
let canvas_out = document.getElementById('canvas_out');
let delay = document.getElementById('delay');
let mirror = document.getElementById('mirror');

// Array of [time, image data]
let buffer = [];

function go() {
  let now = Date.now();
  let context = canvas_in.getContext('2d');

  // Set sizes of elements
  let width = video.videoWidth,
    height = video.videoHeight;
  let width_want = canvas_in.clientWidth;
  height *= width_want / width;
  width = width_want;

  canvas_in.width = width;
  canvas_in.height = height;
  canvas_out.width = width;
  canvas_out.height = height;

  // Copy video to first canvas
  if (mirror.checked) {
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, -width, height);
  } else {
    context.scale(1, 1);
    context.drawImage(video, 0, 0, width, height);
  }

  // Copy first canvas to queue
  let data = context.getImageData(0, 0, width, height);
  buffer.push([now, data]);

  // Discard out of date images and copy head of queue to second canvas
  while (buffer.length >= 2 && buffer[0][0] < now - delay.value * 1000)
    buffer.shift();

  let context2 = canvas_out.getContext('2d');
  context2.putImageData(buffer[0][1], 0, 0);

  // Do it again
  window.setTimeout(go, 30);
}

// Start main loop once video is ready
video.oncanplay = function (event) {
  go();
};

// Attach webcam to video element
navigator.mediaDevices
  .getUserMedia({ video: true, audio: false })
  .then(function (stream) {
    video.srcObject = stream;
    video.play();
  })
  .catch(function (err) {
    console.log('An error occurred: ' + err);
  });
