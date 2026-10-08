// ==========================================================================
// R & A ASSOCIATES HRMS - CONFIGURATION & CONSTANTS
// ==========================================================================

export const STORAGE_KEYS = {
  employees: 'hrms_employees',
  leaves: 'hrms_leaves',
  attendance: 'hrms_attendance',
  activities: 'hrms_activities',
  salaries: 'hrms_salaries',
  payruns: 'hrms_payruns_v2',
  ctc: 'hrms_ctc',
  letters: 'hrms_letters',
  resignations: 'hrms_resignations',
  forwards: 'hrms_payforwards',
  office: 'hrms_office',
  holidays: 'hrms_holidays',
  weekoff: 'hrms_weekoff',
  departments: 'hrms_departments',
  perfCycles: 'hrms_perf_cycles',
  perfGoals: 'hrms_perf_goals',
  perfReviews: 'hrms_perf_reviews',
  recJobs: 'hrms_rec_jobs',
  popups: 'hrms_popups',
  service: 'hrms_service',
  privs: 'hrms_privs',
  payCfg: 'hrms_paycfg',
  modules: 'hrms_modules',
  modCfg: 'hrms_modcfg',
  payouts: 'hrms_payouts',
  otlog: 'hrms_ot',
  fnf: 'hrms_fnf',
  decl: 'hrms_tax_decl',
  stat: 'hrms_stat',
  bio: 'hrms_bio',
  bioCfg: 'hrms_bio_cfg',
  photos: 'hrms_photos',
  geo: 'hrms_geofence',
  selfies: 'hrms_selfies',
  faceCfg: 'hrms_face_cfg',
  faceRef: 'hrms_face_ref',
  popupSeen: 'hrms_popup_seen',
  popCfg: 'hrms_popup_cfg',
  recCands: 'hrms_rec_cands',
  designations: 'hrms_designations',
  perms: 'hrms_permissions',
  permPolicy: 'hrms_perm_policy',
  odReqs: 'hrms_od_requests',
};

export const AVATAR_COLORS = [
  '#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626',
  '#0891b2', '#4f46e5', '#64748b', '#db2777', '#0d9488'
];

export function getInitials(name) {
  if (!name) return '';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export function randomColor() {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
