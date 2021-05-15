import Controller from '@ember/controller';

import { tracked } from '@glimmer/tracking';

import { action } from '@ember/object';

export default class extends Controller {
  @tracked stream;
  @tracked liveStream;
  @tracked delayedStream;
  @tracked showErrorInfo = false;
  @tracked showLiveStream = true;
  @tracked showDelayedStream = true;

  get mediaRecorderConfig() {
    return MediaRecorder.isTypeSupported({ mimeType: 'video/mp4' })
      ? { mimeType: 'video/mp4 '}
      : {};
  }

  download(event) {
    const dateTime = new Date(Date.now()).toLocaleString();
    const url = URL.createObjectURL(event.data);
    const a = document.createElement('a');

    document.body.appendChild(a);

    a.style = "display: none";
    a.href = url;
    a.download = `archers-review-${dateTime}`;
    a.click();

    window.URL.revokeObjectURL(url);

    this.setupLiveStream(this.stream);
  }

  setupLiveStream(stream) {
    const element = document.querySelector('#video');
    element.srcObject = stream;

    this.liveStream = new MediaRecorder(stream, this.mediaRecorderConfig);
    this.liveStream.ondataavailable = this.download.bind(this);
    this.liveStream.start();
  }

  async setupRecordingStream(stream) {
    if (this.delayedStream) this.delayedStream.stop();

    this.delayedStream = new MediaRecorder(stream, this.mediaRecorderConfig);
    this.delayedStream.ondataavailable = this.updateDelayedVideo.bind(this);
    this.delayedStream.start();
  }

  updateDelayedVideo(event) {
    const element = document.querySelector('#delayedVideo');
    const url = URL.createObjectURL(event.data);
    element.src = url;
  }

  @action
  async setupStream() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
          width: 1280,
          height: 720,
          facingMode: 'user'
        }
      });
      this.setupLiveStream(this.stream);
      this.setupRecordingStream(this.stream);
      setInterval(() => this.setupRecordingStream(this.stream), 15000);
    } catch (e) {
      this.showErrorInfo = true;
    }
  }

  @action
  async downloadLiveStream() {
    await this.liveStream.requestData();
  }

  @action
  toggleLiveStream() {
    this.showLiveStream = !this.showLiveStream;
  }

  @action
  toggleDelayedStream() {
    this.showDelayedStream = !this.showDelayedStream;
  }
}
