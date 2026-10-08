// ==========================================================================
// R & A ASSOCIATES HRMS - FINGERPRINT / BIOMETRIC SERVICE
// WebAuthn platform authenticator & Android Native bridge
// ==========================================================================

import { STORAGE_KEYS, uid } from './config.js';
import { load, save } from './storage.js';

let bioOkAt = 0;
let bioFallbackAt = 0;
let bioFallbackWhy = '';

export const getBioCfg = () => load(STORAGE_KEYS.bioCfg) || { required: false };
export const getBio = () => load(STORAGE_KEYS.bio) || {};

const b64u = b => btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64u = t => Uint8Array.from(atob(t.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));

export function deviceId() {
  let d = localStorage.getItem('ra_device_id');
  if (!d) {
    d = uid();
    localStorage.setItem('ra_device_id', d);
  }
  return d;
}

export function bioAndroid() {
  return new Promise(res => {
    if (typeof window === 'undefined' || !window.AndroidBio) return res(false);
    const id = uid().replace(/[^A-Za-z0-9]/g, '');
    window.__bioCb = window.__bioCb || {};
    window.__bioCb[id] = res;
    window.__bioDone = (i, ok) => {
      const f = window.__bioCb[i];
      if (f) {
        delete window.__bioCb[i];
        f(ok);
      }
    };
    window.AndroidBio.authenticate(id);
  });
}

export function bioSourceLabel() {
  const n = Date.now();
  return n - bioOkAt < 120000 ? 'Fingerprint + Selfie' :
         n - bioFallbackAt < 120000 ? 'Selfie (fingerprint unavailable)' : 'Selfie';
}

export async function bioGate(sessionEmp, onToast) {
  const cfg = getBioCfg();
  if (!cfg.emps || !cfg.emps[sessionEmp.id]) return true;

  const all = getBio();
  const mine = all[sessionEmp.id] || [];

  const fallback = why => {
    if (cfg.photoFallback === false) {
      if (onToast) onToast(why + '. Please contact HR.', 'error');
      return false;
    }
    bioFallbackAt = Date.now();
    bioFallbackWhy = why;
    if (onToast) onToast(why + ' – please take a photograph to mark attendance.');
    return true;
  };

  try {
    if (typeof window !== 'undefined' && window.AndroidBio) {
      if (!window.AndroidBio.canAuthenticate()) return fallback('Fingerprint is not set up on this phone');
      const key = 'android-' + deviceId();
      const enrolled = mine.some(c => c.id === key);
      if (!enrolled && !confirm('Register this phone for fingerprint attendance? You will be asked to scan your finger.')) return false;
      if (!(await bioAndroid())) {
        if (onToast) onToast('Fingerprint not verified', 'error');
        return false;
      }
      if (!enrolled) {
        mine.push({ id: key, at: new Date().toISOString(), name: 'Android app' });
        all[sessionEmp.id] = mine;
        save(STORAGE_KEYS.bio, all);
      }
      bioOkAt = Date.now();
      return true;
    }

    if (typeof window === 'undefined' || !window.isSecureContext || !window.PublicKeyCredential || !navigator.credentials) {
      return fallback('This browser does not support fingerprint verification');
    }

    if (/^\d+\.\d+\.\d+\.\d+$/.test(location.hostname)) {
      return fallback('Fingerprint needs the web domain name (not the IP address)');
    }

    if (!(await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable())) {
      return fallback('No fingerprint or screen lock is set up on this device');
    }

    const web = mine.filter(c => !c.id.startsWith('android-'));
    const ch = crypto.getRandomValues(new Uint8Array(32));

    if (!web.length) {
      if (!confirm('Register this phone for fingerprint attendance? You will be asked to scan your finger.')) return false;
      const cred = await navigator.credentials.create({
        publicKey: {
          rp: { name: 'R & A HRMS', id: location.hostname },
          user: { id: new TextEncoder().encode(sessionEmp.id), name: sessionEmp.empCode || sessionEmp.name, displayName: sessionEmp.name },
          challenge: ch,
          pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
          authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'discouraged' },
          timeout: 60000
        }
      });
      mine.push({ id: b64u(cred.rawId), at: new Date().toISOString(), name: 'Browser / phone' });
      all[sessionEmp.id] = mine;
      save(STORAGE_KEYS.bio, all);
    } else {
      await navigator.credentials.get({
        publicKey: {
          challenge: ch,
          rpId: location.hostname,
          allowCredentials: web.map(c => ({ type: 'public-key', id: unb64u(c.id) })),
          userVerification: 'required',
          timeout: 60000
        }
      });
    }

    bioOkAt = Date.now();
    return true;
  } catch (e) {
    if (e && (e.name === 'NotSupportedError' || e.name === 'SecurityError')) {
      return fallback('Fingerprint is not available in this browser');
    }
    if (onToast) onToast('Fingerprint failed, cancelled, or this phone is not registered.', 'error');
    return false;
  }
}
