const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

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

function getColorBySize(bbox) {
    const area = bbox[2] * bbox[3];
    const maxArea = canvas.width * canvas.height;
    const ratio = area / maxArea;

    const red = 255;
    const green = Math.floor(255 * ratio);
    const blue = 0;

    return `rgb(${red}, ${green}, ${blue})`;
}

async function drawPredictions(predictions) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.font = '16px sans-serif';
    ctx.textBaseline = 'top';

    predictions.forEach(prediction => {
        const x = prediction.bbox[0];
        const y = prediction.bbox[1];
        const width = prediction.bbox[2];
        const height = prediction.bbox[3];

        ctx.strokeStyle = getColorBySize(prediction.bbox);
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        ctx.fillStyle = getColorBySize(prediction.bbox);
        ctx.fillText(prediction.class, x, y);
    });
}

async function detectObjects() {
    const model = await cocoSsd.load();

    async function detectFrame() {
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
