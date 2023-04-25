const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const summaryBox = document.createElement('div');

summaryBox.style.position = 'absolute';
summaryBox.style.padding = '10px';
summaryBox.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
summaryBox.style.color = 'white';
summaryBox.style.borderRadius = '5px';
summaryBox.style.fontSize = '14px';
summaryBox.style.maxWidth = '250px';
summaryBox.style.display = 'none';

document.body.appendChild(summaryBox);

async function setupCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 640, height: 480 },
    audio: false
  });
  video.srcObject = stream;
  video.onloadedmetadata = () => {
    video.width = video.videoWidth;
    video.height = video.videoHeight;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  };

  return new Promise((resolve) => {
    video.onloadeddata = () => {
      resolve(video);
    };
  });
}

// ... (the rest of the code remains the same) ...

async function detectObjects() {
  const model = await cocoSsd.load();

  async function detectFrame() {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height); // Add this line to draw the video feed onto the canvas
    const predictions = await model.detect(video);
    drawPredictions(predictions);
    requestAnimationFrame(detectFrame);
  }

  detectFrame();
}

(async function() {
  const videoElement = await setupCamera();
  videoElement.play();
  detectObjects();
})();

   
