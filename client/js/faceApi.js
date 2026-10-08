// ==========================================================================
// R & A ASSOCIATES HRMS - FACE RECOGNITION SERVICE
// Client-side inference powered by face-api.js and pre-trained weights
// ==========================================================================

import { STORAGE_KEYS } from './config.js';
import { load, save } from './storage.js';

export const FACE_FLAG = ['mismatch', 'noface', 'multi'];

export const FACE_LABEL = {
  match: 'Match',
  mismatch: 'Mismatch',
  noface: 'No face seen',
  multi: 'More than one face',
  noref: 'No registered face',
  unchecked: 'Not checked'
};

export const getFaceCfg = () => ({
  mode: 'off',
  threshold: 0.5,
  ...(load(STORAGE_KEYS.faceCfg) || {})
});

export function faceBadge(f, blocked) {
  if (!f) return '<span class="dept-tag">—</span>';
  const cls = f.state === 'match' ? 'badge-success' : FACE_FLAG.includes(f.state) ? 'badge-danger' : 'badge-warning';
  return `<span class="badge ${cls}">${FACE_LABEL[f.state] || f.state}${f.d != null ? ' (' + f.d + ')' : ''}</span>${blocked ? '<div class="dept-tag" style="color:var(--danger)">Check-in refused</div>' : ''}`;
}

let faceLib = null;
let FD = {};

export function faceLoad() {
  if (faceLib) return faceLib;
  faceLib = (async () => {
    if (typeof window === 'undefined') return false;

    if (!window.faceapi) {
      await new Promise((resolve, reject) => {
        const sc = document.createElement('script');
        sc.src = '/faceapi/face-api.js';
        sc.onload = resolve;
        sc.onerror = () => reject(new Error('/faceapi/face-api.js not found on the server'));
        document.head.appendChild(sc);
      });
    }

    const n = window.faceapi.nets;
    const M = '/faceapi/model';
    const miss = [];

    const tryNet = async (net, name) => {
      try {
        await net.loadFromUri(M);
        return true;
      } catch {
        miss.push(name);
        return false;
      }
    };

    FD.det = (await tryNet(n.ssdMobilenetv1, 'ssd_mobilenetv1_model')) ? 'ssd' :
             ((await tryNet(n.tinyFaceDetector, 'tiny_face_detector_model')) ? 'tiny' : '');

    FD.tinyLm = !(await tryNet(n.faceLandmark68Net, 'face_landmark_68_model'));
    if (FD.tinyLm && !(await tryNet(n.faceLandmark68TinyNet, 'face_landmark_68_tiny_model'))) {
      FD.lm = false;
    }

    const rec = await tryNet(n.faceRecognitionNet, 'face_recognition_model');
    if (!FD.det || FD.lm === false || !rec) {
      throw new Error('Missing face model files in /faceapi/model: ' + miss.join(', '));
    }
    return true;
  })().catch(e => {
    faceLib = null;
    throw e;
  });

  return faceLib;
}

export async function faceDesc(src) {
  const opt = FD.det === 'ssd' ?
    new window.faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }) :
    new window.faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 });

  const all = await window.faceapi.detectAllFaces(src, opt).withFaceLandmarks(FD.tinyLm).withFaceDescriptors();
  if (!all.length) return null;
  all.sort((a, b) => b.detection.box.area - a.detection.box.area);
  return { desc: Array.from(all[0].descriptor), n: all.length };
}

export const faceImg = url => new Promise((resolve, reject) => {
  const im = new Image();
  im.onload = () => resolve(im);
  im.onerror = () => reject(new Error('photo could not be read'));
  im.src = url;
});

export async function faceRef(empId, photoMap) {
  const photo = photoMap ? photoMap[empId] : null;
  if (!photo) return null;

  const sig = photo.length + ':' + photo.slice(-40);
  const refs = load(STORAGE_KEYS.faceRef) || {};

  if (refs[empId] && refs[empId].sig === sig) {
    return refs[empId].d.length ? refs[empId].d : 'noface';
  }

  await faceLoad();
  const r = await faceDesc(await faceImg(photo));
  refs[empId] = { sig, d: r ? r.desc.map(x => +x.toFixed(4)) : [] };
  save(STORAGE_KEYS.faceRef, refs);
  return r ? refs[empId].d : 'noface';
}

export async function faceCheck(empId, videoOrCanvas, thr, photoMap) {
  await faceLoad();
  const ref = await faceRef(empId, photoMap);
  if (!ref || ref === 'noface') return { state: 'noref' };

  const live = await faceDesc(videoOrCanvas);
  if (!live) return { state: 'noface' };

  const d = +window.faceapi.euclideanDistance(ref, live.desc).toFixed(2);
  return live.n > 1 ? { state: 'multi', d } : { state: d <= thr ? 'match' : 'mismatch', d };
}
