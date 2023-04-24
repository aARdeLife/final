let video;
let objectDetector;
let canvas;
let objects = [];
let selectedIndex = -1;
let readButton;

function setup() {
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  canvas = createCanvas(640, 480);
  canvas.parent('canvas-container');

  readButton = document.getElementById('read-objects');
  readButton.addEventListener('click', readObjects);

  objectDetector = ml5.objectDetector('cocossd', modelReady);
}

function modelReady() {
  console.log('Model is ready');
  objectDetector.detect(video, gotResults);
}

function gotResults(err, results) {
  if (err) {
    console.error(err);
    return;
  }

  objects = results;
  objectDetector.detect(video, gotResults);
}

function draw() {
  image(video, 0, 0);
  drawBoxes();
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

function readObjects() {
  let objectsNames = objects.map(obj => obj.label);
  let sentence = objectsNames.join(', ');
  let utterance = new SpeechSynthesisUtterance(`Detected objects are: ${sentence}`);
  speechSynthesis.speak(utterance);
}
