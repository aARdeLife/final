let video;
let model;
let canvas;
let ctx;
let objects = [];
let selectedIndex = -1;
let readButton;
let lastDetectionTime = 0;
let detectionInterval = 200;

async function setupModel() {
  model = await cocoSsd.load();
  console.log('Model loaded');
}

function setup() {
  video = createCapture(VIDEO);
  video.size(1280, 720);
  video.hide();

  canvas = createCanvas(1280, 720);
  canvas.parent('canvas-container');
  ctx = canvas.drawingContext;

  readButton = document.getElementById('read-objects');
  readButton.addEventListener('click', readObjects);

  setupModel();
}

function draw() {
  clear();
  image(video, 0, 0);

  if (Date.now() - lastDetectionTime > detectionInterval) {
    detectObjects();
    lastDetectionTime = Date.now();
  }

  drawBoxes();
}

async function detectObjects() {
  if (model) {
    await tf.tidy(() => {
      model.detect(video).then(predictions => {
        objects = predictions;
      });
    });
  }
}

function drawBoxes() {
  for (let i = 0; i < objects.length; i++) {
    let box = objects[i].bbox;

    if (i === selectedIndex) {
      stroke('green');
    } else {
      stroke('yellow');
    }
    strokeWeight(4);
    noFill();
    rect(box[0], box[1], box[2], box[3]);
  }
}

function mouseClicked() {
  selectedIndex = -1;

  for (let i = 0; i < objects.length; i++) {
    let box = objects[i].bbox;
    if (mouseX >= box[0] && mouseX <= box[0] + box[2] && mouseY >= box[1] && mouseY <= box[1] + box[3]) {
      selectedIndex = i;
      break;
    }
  }
}

function mousePressed() {
  if (mouseButton === CENTER) {
    mouseClicked();
  }
}

function readObjects() {
  let objectsNames = objects.map(obj => obj.class);
  let sentence = objectsNames.join(', ');
  let utterance = new SpeechSynthesisUtterance(`Detected objects are: ${sentence}`);
  speechSynthesis.speak(utterance);
}
