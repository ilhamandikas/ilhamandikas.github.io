// Record a clip from the camera. Everything stays on the device.
const { tk } = window;

const video = document.querySelector('#cam-video');
const startButton = document.querySelector('#cam-start');
const recordButton = document.querySelector('#cam-record');
const stopButton = document.querySelector('#cam-stop');
const downloadLink = document.querySelector('#cam-download');
const status = document.querySelector('#cam-status');

let stream = null;
let recorder = null;
let chunks = [];

startButton.addEventListener('click', async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    video.srcObject = stream;
    recordButton.disabled = false;
    tk.setStatus(status, 'Camera ready', 'ok');
  } catch (error) {
    tk.setStatus(status, error.message, 'err');
  }
});

recordButton.addEventListener('click', () => {
  if (!stream) return;
  chunks = [];
  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm';
  recorder = new MediaRecorder(stream, { mimeType });
  recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: 'video/webm' });
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.hidden = false;
    tk.setStatus(status, 'Recording ready', 'ok');
  };
  recorder.start();
  recordButton.disabled = true;
  stopButton.disabled = false;
  tk.setStatus(status, 'Recording…', 'ok');
});

stopButton.addEventListener('click', () => {
  if (recorder && recorder.state !== 'inactive') recorder.stop();
  recordButton.disabled = false;
  stopButton.disabled = true;
});

window.addEventListener('pagehide', () => {
  if (stream) stream.getTracks().forEach((track) => track.stop());
});
