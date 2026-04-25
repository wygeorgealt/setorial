const fs = require('fs');
const path = require('path');

function createWav(durationSec, sampleRate, audioDataFn) {
  const numSamples = Math.floor(durationSec * sampleRate);
  const buffer = Buffer.alloc(44 + numSamples * 2);

  // RIFF Chunk Descriptor
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4); // ChunkSize
  buffer.write('WAVE', 8);

  // "fmt " sub-chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size
  buffer.writeUInt16LE(1, 20);  // AudioFormat (1 = PCM)
  buffer.writeUInt16LE(1, 22);  // NumChannels (1 = Mono)
  buffer.writeUInt32LE(sampleRate, 24); // SampleRate
  buffer.writeUInt32LE(sampleRate * 2, 28); // ByteRate
  buffer.writeUInt16LE(2, 32);  // BlockAlign
  buffer.writeUInt16LE(16, 34); // BitsPerSample

  // "data" sub-chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 2, 40);

  // Write audio data
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = audioDataFn(t, i, numSamples);
    
    // Apply highly aggressive fade out to avoid clicks
    const fadeOutSamples = Math.min(400, numSamples);
    if (i > numSamples - fadeOutSamples) {
       sample *= (numSamples - i) / fadeOutSamples;
    }
    
    // Convert to 16-bit PCM integer
    const intSample = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));
    buffer.writeInt16LE(intSample, 44 + i * 2);
  }

  return buffer;
}

const dir = path.join(__dirname, '..', 'assets', 'sounds');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

// 1. "tap.wav" - Standard short click (very short, low frequency thump mixed with noise)
const tapWav = createWav(0.04, 44100, (t) => {
  // exponentially decaying envelope
  const env = Math.exp(-t * 150);
  // mix of a 200hz sine and some noise
  return env * (Math.sin(2 * Math.PI * 200 * t) * 0.4 + (Math.random() * 2 - 1) * 0.2);
});
fs.writeFileSync(path.join(dir, 'tap.wav'), tapWav);

// 2. "pop.wav" - Bright action click (higher pitch, quick sweep)
const popWav = createWav(0.08, 44100, (t) => {
  const env = Math.exp(-t * 60);
  // pitch drops from 1000hz down
  const freq = 1000 * Math.exp(-t * 20); 
  return env * Math.sin(2 * Math.PI * freq * t) * 0.7;
});
fs.writeFileSync(path.join(dir, 'pop.wav'), popWav);

// 3. "boop.wav" - Deep back click (hollow, dull)
const boopWav = createWav(0.05, 44100, (t) => {
  const env = Math.exp(-t * 80);
  // low freq
  return env * Math.sin(2 * Math.PI * 150 * t) * 0.8;
});
fs.writeFileSync(path.join(dir, 'boop.wav'), boopWav);

console.log("Wrote tap.wav, pop.wav, boop.wav");
