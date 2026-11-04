/* SBC portal demo data. Fictional companies, placeholder buyers, investors and agents.
   Shared by every portal view. The store copies this seed into the browser and keeps changes there. */
window.SBC_SEED = {
  today: '2026-11-04',
  officers: { A: { id: 'A', name: 'Officer A' }, B: { id: 'B', name: 'Officer B' } },
  sectors: { water: 'Water and utilities', energy: 'Energy', transport: 'Transport', technology: 'Technology', healthcare: 'Healthcare', marine: 'Marine survey', construction: 'Construction', logistics: 'Logistics' },
  capabilities: {
    'ro-maintenance': 'RO plant maintenance', 'desal-build': 'Desalination plant build', membranes: 'Membrane supply', 'plant-audit': 'Water plant audit',
    'solar-om': 'Solar plant O&M', 'solar-build': 'Solar plant build', 'rail-signalling': 'Rail signalling', 'cyber-training': 'Cyber security training',
    'medical-servicing': 'Medical equipment servicing', 'hydro-survey': 'Hydrographic survey', 'data-platforms': 'Data platforms', 'fire-safety': 'Fire safety systems', pipeline: 'Pipeline construction'
  },

  companies: [
    { id: 'halvorsen', name: 'Halvorsen Water Systems GmbH', short: 'Halvorsen Water', country: 'Germany', city: 'Hamburg', sector: 'water', target: ['UAE'],
      applied: '2026-10-28', stage: 'check', since: '2026-11-02', due: '2026-11-05', owner: 'A', capabilities: ['ro-maintenance', 'desal-build'], refs: 3, raising: false,
      contact: 'Erik Halvorsen', signatory: 'Erik Halvorsen',
      reg: { registry: 'Handelsregister B, Amtsgericht Hamburg', number: 'HRB 148372', name: 'Halvorsen Water Systems GmbH', status: 'Active', insolvency: false, incorporated: '2014-05-18', address: 'Großer Grasbrook 14, 20457 Hamburg', directors: ['Erik Halvorsen'], lastEntry: '2026-07-02', lang: 'German' },
      owners: [
        { name: 'Halvorsen Holding GmbH', kind: 'company', pct: 100, of: 'self', src: 'official', ref: 'HRB 139905' },
        { name: 'Erik Halvorsen', kind: 'person', pct: 40, of: 'Halvorsen Holding GmbH', src: 'official' },
        { name: 'Nordkap Invest Ltd', kind: 'company', pct: 60, of: 'Halvorsen Holding GmbH', src: 'official', ref: 'Cyprus, HE 401227' },
        { name: 'Ingrid Moen', kind: 'person', pct: 100, of: 'Nordkap Invest Ltd', src: 'company' }
      ],
      licences: [{ name: 'ISO 9001:2015', issuer: 'TÜV Nord', holder: 'Halvorsen Water Systems GmbH', expires: '2027-02-13' }],
      screening: { run: '2026-11-02', parties: ['Halvorsen Water Systems GmbH', 'Halvorsen Holding GmbH', 'Erik Halvorsen', 'Ingrid Moen'],
        hits: [{ kind: 'media', name: 'Erik Halvorsen', note: 'An article names an Erik Halvorsen born 1958 in Norway. Ours was born 1971 in Germany.' }] },
      local: { UAE: {} },
      review: { round: 1, scope: null, k1: { by: 'A', answers: { 'ID-1.0': 'confirm', 'ID-2.0': 'confirm', 'ID-3.0': 'confirm', 'OWN-1.0': 'confirm', 'OWN-1.1': 'confirm', 'OWN-1.2': 'confirm', 'LIC-1.0': 'confirm', 'LIC-2.0': 'confirm', 'GR-1.0': 'request' } }, k2: null }
    },
    { id: 'varun', name: 'Varun Rail Signalling Pvt Ltd', short: 'Varun Rail', country: 'India', city: 'Bengaluru', sector: 'transport', target: ['KSA'],
      applied: '2026-10-30', stage: 'check', since: '2026-11-04', due: '2026-11-07', owner: null, capabilities: ['rail-signalling'], refs: 2, raising: false,
      contact: 'Meera Pillai', signatory: 'Meera Pillai',
      reg: { registry: 'Registrar of Companies, Karnataka', number: 'CIN U74999KA2011PTC058123', name: 'Varun Rail Signalling Pvt Ltd', status: 'Active', insolvency: false, incorporated: '2011-03-09', address: '14 Residency Road, Bengaluru 560025', directors: ['Devesh Karanth', 'Meera Pillai'], lastEntry: '2026-05-19' },
      owners: [
        { name: 'Devesh Karanth', kind: 'person', pct: 55, of: 'self', src: 'official' },
        { name: 'Meera Pillai', kind: 'person', pct: 45, of: 'self', src: 'official' }
      ],
      licences: [
        { name: 'ISO 9001:2015', issuer: 'Bureau Veritas', holder: 'Varun Rail Signalling Pvt Ltd', expires: '2027-08-30' },
        { name: 'ISO 45001:2018', issuer: 'Bureau Veritas', holder: 'Varun Rail Signalling Pvt Ltd', expires: '2026-12-20' }
      ],
      screening: { run: '2026-11-04', parties: ['Varun Rail Signalling Pvt Ltd', 'Devesh Karanth', 'Meera Pillai'],
        hits: [{ kind: 'sanctions', name: 'Devesh Karanth', list: '[sanctions list]', note: 'Listed as Devesh K. Karanth, born 1966. Ours was born 1966 in Bengaluru. Name and year match.' }] },
      local: { KSA: { agent: '[Agent D] Co.' } },
      review: { round: 1, scope: null, k1: null, k2: null }
    },
    { id: 'aquamar', name: 'Aquamar Desalación S.L.', short: 'Aquamar Desalación', country: 'Spain', city: 'Alicante', sector: 'water', target: ['UAE'],
      applied: '2026-10-31', stage: 'check', since: '2026-11-03', due: '2026-11-06', owner: null, capabilities: ['desal-build', 'ro-maintenance'], refs: 2, raising: true,
      contact: 'Lucía Ferrer', signatory: 'Lucía Ferrer',
      reg: { registry: 'Registro Mercantil de Alicante', number: 'B-03458921', name: 'Aquamar Desalación S.L.', status: 'Active', insolvency: false, incorporated: '2009-02-11', address: 'Avenida de Elche 112, 03008 Alicante', directors: ['Lucía Ferrer'], lastEntry: '2026-03-02', lang: 'Spanish' },
      owners: [
        { name: 'Lucía Ferrer', kind: 'person', pct: 70, of: 'self', src: 'official' },
        { name: 'Javier Ferrer', kind: 'person', pct: 30, of: 'self', src: 'official' }
      ],
      licences: [
        { name: 'ISO 9001:2015', issuer: 'AENOR', holder: 'Aquamar Desalación S.L.', expires: '2028-01-10' },
        { name: 'ISO 14001:2015', issuer: 'AENOR', holder: 'Aquamar Desalación S.L.', expires: '2027-11-03' }
      ],
      screening: { run: '2026-11-03', parties: ['Aquamar Desalación S.L.', 'Lucía Ferrer', 'Javier Ferrer'], hits: [] },
      local: { UAE: {} },
      review: { round: 1, scope: null, k1: null, k2: null }
    },
    { id: 'northgate', name: 'Northgate Cyber Training Ltd', short: 'Northgate Cyber', country: 'United Kingdom', city: 'Leeds', sector: 'technology', target: ['Qatar', 'UAE'],
      applied: '2026-10-14', stage: 'sign', since: '2026-10-29', due: '2026-10-31', owner: 'B', capabilities: ['cyber-training'], refs: 4, raising: false,
      contact: 'Amara Okafor', signatory: 'Amara Okafor',
      reg: { registry: 'Companies House', number: '09184467', name: 'Northgate Cyber Training Ltd', status: 'Active', insolvency: false, incorporated: '2014-09-03', address: '4 Wellington Place, Leeds LS1 4AP', directors: ['Amara Okafor'], lastEntry: '2026-09-12' },
      owners: [
        { name: 'Amara Okafor', kind: 'person', pct: 75, of: 'self', src: 'official' },
        { name: 'Daniel Reyes', kind: 'person', pct: 25, of: 'self', src: 'official' }
      ],
      licences: [
        { name: 'ISO/IEC 27001:2022', issuer: 'BSI', holder: 'Northgate Cyber Training Ltd', expires: '2027-06-30' },
        { name: 'Cyber Essentials Plus', issuer: 'IASME', holder: 'Northgate Cyber Training Ltd', expires: '2027-03-15' }
      ],
      screening: { run: '2026-10-29', parties: ['Northgate Cyber Training Ltd', 'Amara Okafor', 'Daniel Reyes'], hits: [] },
      local: { Qatar: { agent: '[Agent E] WLL' }, UAE: { entity: 'Northgate Cyber Training FZ-LLC' } },
      review: { round: 1, scope: null, k1: { by: 'B', at: '2026-10-29', sent: true, outcome: 'qualified', answers: 'all' }, k2: null }
    },
    { id: 'pacifica', name: 'Pacifica Survey Pty Ltd', short: 'Pacifica Survey', country: 'Australia', city: 'Perth', sector: 'marine', target: ['UAE'],
      applied: '2026-10-20', stage: 'sign', since: '2026-11-03', due: '2026-11-06', owner: 'A', capabilities: ['hydro-survey'], refs: 2, raising: false,
      contact: 'Grace Whitlam', signatory: 'Grace Whitlam',
      reg: { registry: 'Australian Securities and Investments Commission', number: 'ACN 612 345 908', name: 'Pacifica Survey Pty Ltd', status: 'Registered', insolvency: false, incorporated: '2016-07-22', address: '88 St Georges Terrace, Perth WA 6000', directors: ['Grace Whitlam'], lastEntry: '2026-06-30' },
      owners: [{ name: 'Grace Whitlam', kind: 'person', pct: 100, of: 'self', src: 'official' }],
      licences: [{ name: 'ISO 9001:2015', issuer: 'SAI Global', holder: 'Pacifica Survey Pty Ltd', expires: '2027-09-01' }],
      screening: { run: '2026-11-03', parties: ['Pacifica Survey Pty Ltd', 'Grace Whitlam'], hits: [] },
      local: { UAE: { agent: '[Agent A] LLC' } },
      review: { round: 1, scope: null, k1: { by: 'A', at: '2026-11-03', sent: true, outcome: 'qualified', answers: 'all' }, k2: null }
    },
    { id: 'orrin', name: 'Orrin Labs Inc.', short: 'Orrin Labs', country: 'Canada', city: 'Toronto', sector: 'technology', target: ['UAE'],
      applied: '2026-10-06', stage: 'plan', since: '2026-10-30', due: '2026-11-13', owner: 'B', capabilities: ['data-platforms'], refs: 1, raising: true,
      contact: 'Priya Natarajan', signatory: 'Priya Natarajan', decided: '2026-10-30', outcome: 'conditional',
      reg: { registry: 'Corporations Canada', number: '1182736-4', name: 'Orrin Labs Inc.', status: 'Active', insolvency: false, incorporated: '2018-04-10', address: '220 King Street West, Toronto ON M5H 1K4', directors: ['Priya Natarajan', 'Tom Becker'], lastEntry: '2026-04-11' },
      owners: [
        { name: 'Priya Natarajan', kind: 'person', pct: 60, of: 'self', src: 'official' },
        { name: 'Tom Becker', kind: 'person', pct: 40, of: 'self', src: 'official' }
      ],
      licences: [{ name: 'ISO/IEC 27001:2022', issuer: 'BSI', holder: 'Orrin Labs Inc.', expires: '2027-04-30' }],
      screening: { run: '2026-10-28', parties: ['Orrin Labs Inc.', 'Priya Natarajan', 'Tom Becker'], hits: [] },
      local: { UAE: {} },
      plan: { sent: '2026-10-30', items: [
        { id: 'p1', rule: 'GR-1', check: 'readiness', text: 'ICV certificate, or proof of application', due: '2026-11-13', done: false },
        { id: 'p2', rule: 'GR-1', check: 'readiness', text: 'Signed agreement with a UAE agent from the panel', due: '2026-11-13', done: false, agents: ['a1', 'a2'] }
      ] },
      review: { round: 1, scope: null, k1: { by: 'B', at: '2026-10-28', sent: true, outcome: 'conditional', answers: 'all', requested: ['GR-1.0'] }, k2: { by: 'A', at: '2026-10-30', answers: 'all', requested: ['GR-1.0'] } }
    },
    { id: 'hanbit', name: 'Hanbit Pipeline Co., Ltd.', short: 'Hanbit Pipeline', country: 'South Korea', city: 'Ulsan', sector: 'energy', target: ['KSA'],
      applied: '2026-10-22', stage: 'uploading', since: '2026-10-29', owner: 'B', capabilities: ['pipeline'], refs: 4, raising: false, contact: 'Park Ji-ho',
      uploads: { have: ['Certificate of incorporation or trade licence', 'Register extract', 'Ownership chart', 'IDs for owners and directors', 'Licences and certifications', 'Company profile and references', 'Local entity or agent agreement', 'Declaration signed by a director', 'ICV certificate'] }
    },
    { id: 'corvel', name: 'Corvel Fire Safety Ltd', short: 'Corvel Fire Safety', country: 'Ireland', city: 'Cork', sector: 'construction', target: ['UAE'],
      applied: '2026-11-01', stage: 'uploading', since: '2026-11-01', owner: null, capabilities: ['fire-safety'], refs: 1, raising: true, contact: 'Siobhán Walsh',
      uploads: { have: ['Certificate of incorporation or trade licence', 'Company profile and references'] }
    },
    { id: 'brunnvik', name: 'Brunnvik Water AS', short: 'Brunnvik Water', country: 'Norway', city: 'Bergen', sector: 'water', target: ['UAE', 'Bahrain'],
      applied: '2026-07-14', stage: 'qualified', since: '2026-08-02', owner: 'B', capabilities: ['ro-maintenance', 'plant-audit'], refs: 5, raising: true,
      contact: 'Ola Brunnvik', signatory: 'Ola Brunnvik', decided: '2026-08-02', outcome: 'qualified',
      mark: { id: 'SBC-Q-2026-0004', issued: '2026-08-02', validTo: '2027-08-02', lastScreen: '2026-11-01' },
      reg: { registry: 'Brønnøysund Register Centre', number: '918 334 572', name: 'Brunnvik Water AS', status: 'Active', insolvency: false, incorporated: '2009-11-02', address: 'Strandkaien 3, 5013 Bergen', directors: ['Ola Brunnvik'], lastEntry: '2026-02-17', lang: 'Norwegian' },
      owners: [
        { name: 'Ola Brunnvik', kind: 'person', pct: 65, of: 'self', src: 'official' },
        { name: 'Kari Lunde', kind: 'person', pct: 35, of: 'self', src: 'official' }
      ],
      licences: [
        { name: 'ISO 9001:2015', issuer: 'DNV', holder: 'Brunnvik Water AS', expires: '2027-10-01' },
        { name: 'ISO 14001:2015', issuer: 'DNV', holder: 'Brunnvik Water AS', expires: '2027-10-01' }
      ],
      screening: { run: '2026-11-01', parties: ['Brunnvik Water AS', 'Ola Brunnvik', 'Kari Lunde'], hits: [] },
      local: { UAE: { agent: '[Agent C] LLC', icv: '22.0%' }, Bahrain: { agent: '[Agent C] LLC' } },
      review: { round: 1, scope: null, k1: { by: 'B', at: '2026-07-30', sent: true, outcome: 'qualified', answers: 'all' }, k2: { by: 'A', at: '2026-08-02', answers: 'all' } }
    },
    { id: 'lumen', name: 'Lumen Grid Solar BV', short: 'Lumen Grid Solar', country: 'Netherlands', city: 'Rotterdam', sector: 'energy', target: ['UAE', 'KSA'],
      applied: '2026-10-05', stage: 'qualified', since: '2026-11-02', owner: 'A', capabilities: ['solar-om', 'solar-build'], refs: 4, raising: true,
      contact: 'Sanne de Vries', signatory: 'Sanne de Vries', decided: '2026-11-02', outcome: 'qualified',
      mark: { id: 'SBC-Q-2026-0009', issued: '2026-11-02', validTo: '2027-11-02', lastScreen: '2026-11-02' },
      reg: { registry: 'Netherlands Chamber of Commerce (KVK)', number: '71048392', name: 'Lumen Grid Solar BV', status: 'Active', insolvency: false, incorporated: '2017-01-16', address: 'Wilhelminakade 91, 3072 AP Rotterdam', directors: ['Sanne de Vries'], lastEntry: '2026-01-09', lang: 'Dutch' },
      owners: [
        { name: 'Lumen Holding BV', kind: 'company', pct: 100, of: 'self', src: 'official', ref: 'KVK 70993118' },
        { name: 'Sanne de Vries', kind: 'person', pct: 80, of: 'Lumen Holding BV', src: 'official' },
        { name: 'Pieter Bakker', kind: 'person', pct: 20, of: 'Lumen Holding BV', src: 'official' }
      ],
      licences: [{ name: 'ISO 9001:2015', issuer: 'Kiwa', holder: 'Lumen Grid Solar BV', expires: '2028-03-31' }],
      screening: { run: '2026-11-02', parties: ['Lumen Grid Solar BV', 'Lumen Holding BV', 'Sanne de Vries', 'Pieter Bakker'], hits: [] },
      local: { UAE: { entity: 'Lumen Grid Solar FZE' }, KSA: { agent: '[Agent D] Co.' } },
      review: { round: 1, scope: null, k1: { by: 'B', at: '2026-10-30', sent: true, outcome: 'qualified', answers: 'all' }, k2: { by: 'A', at: '2026-11-02', answers: 'all' } }
    },
    { id: 'kestrel', name: 'Kestrel Membranes Ltd', short: 'Kestrel Membranes', country: 'United Kingdom', city: 'Aberdeen', sector: 'water', target: ['UAE', 'KSA'],
      applied: '2026-04-20', stage: 'qualified', since: '2026-05-14', owner: 'A', capabilities: ['membranes', 'ro-maintenance'], refs: 3, raising: true,
      contact: 'Callum Reid', signatory: 'Callum Reid', decided: '2026-05-14', outcome: 'qualified',
      mark: { id: 'SBC-Q-2026-0001', issued: '2026-05-14', validTo: '2027-05-14', lastScreen: '2026-11-01' },
      reg: { registry: 'Companies House', number: 'SC512877', name: 'Kestrel Membranes Ltd', status: 'Active', insolvency: false, incorporated: '2015-08-24', address: '12 Union Row, Aberdeen AB10 1SA', directors: ['Callum Reid', 'Fiona Grant'], lastEntry: '2026-08-20' },
      owners: [
        { name: 'Callum Reid', kind: 'person', pct: 50, of: 'self', src: 'official' },
        { name: 'Fiona Grant', kind: 'person', pct: 50, of: 'self', src: 'official' }
      ],
      licences: [{ name: 'ISO 9001:2015', issuer: 'LRQA', holder: 'Kestrel Membranes Ltd', expires: '2027-06-12' }],
      screening: { run: '2026-11-01', parties: ['Kestrel Membranes Ltd', 'Callum Reid', 'Fiona Grant'], hits: [] },
      local: { UAE: { agent: '[Agent C] LLC' }, KSA: {} },
      review: { round: 1, scope: null, k1: { by: 'A', at: '2026-05-10', sent: true, outcome: 'qualified', answers: 'all' }, k2: { by: 'B', at: '2026-05-14', answers: 'all' } }
    },
    { id: 'tessaro', name: 'Tessaro Medical S.r.l.', short: 'Tessaro Medical', country: 'Italy', city: 'Bologna', sector: 'healthcare', target: ['UAE'],
      applied: '2026-08-25', stage: 'qualified', since: '2026-09-18', owner: 'B', capabilities: ['medical-servicing'], refs: 3, raising: false,
      contact: 'Giulia Rinaldi', signatory: 'Giulia Rinaldi', decided: '2026-09-18', outcome: 'qualified',
      mark: { id: 'SBC-Q-2026-0006', issued: '2026-09-18', validTo: '2027-09-18', lastScreen: '2026-11-01' },
      reg: { registry: 'Registro delle Imprese di Bologna', number: 'BO-512093', name: 'Tessaro Medical S.r.l.', status: 'Active', insolvency: false, incorporated: '2012-06-04', address: 'Via Stalingrado 37, 40128 Bologna', directors: ['Giulia Rinaldi'], lastEntry: '2026-04-28', lang: 'Italian' },
      owners: [{ name: 'Giulia Rinaldi', kind: 'person', pct: 100, of: 'self', src: 'official' }],
      licences: [{ name: 'ISO 13485:2016', issuer: 'IMQ', holder: 'Tessaro Medical S.r.l.', expires: '2027-12-01' }],
      screening: { run: '2026-11-01', parties: ['Tessaro Medical S.r.l.', 'Giulia Rinaldi'], hits: [] },
      local: { UAE: { agent: '[Agent B] FZE' } },
      review: { round: 1, scope: null, k1: { by: 'B', at: '2026-09-15', sent: true, outcome: 'qualified', answers: 'all' }, k2: { by: 'A', at: '2026-09-18', answers: 'all' } }
    },
    { id: 'altmark', name: 'Altmark Signal GmbH', short: 'Altmark Signal', country: 'Germany', city: 'Braunschweig', sector: 'transport', target: ['KSA', 'UAE'],
      applied: '2026-06-10', stage: 'qualified', since: '2026-07-09', owner: 'A', capabilities: ['rail-signalling'], refs: 6, raising: true,
      contact: 'Jonas Weber', signatory: 'Jonas Weber', decided: '2026-07-09', outcome: 'qualified',
      mark: { id: 'SBC-Q-2026-0003', issued: '2026-07-09', validTo: '2027-07-09', lastScreen: '2026-11-01' },
      reg: { registry: 'Handelsregister B, Amtsgericht Braunschweig', number: 'HRB 207714', name: 'Altmark Signal GmbH', status: 'Active', insolvency: false, incorporated: '2004-10-01', address: 'Hagenring 21, 38106 Braunschweig', directors: ['Jonas Weber'], lastEntry: '2026-02-03', lang: 'German' },
      owners: [{ name: 'Jonas Weber', kind: 'person', pct: 100, of: 'self', src: 'official' }],
      licences: [{ name: 'ISO 9001:2015', issuer: 'TÜV Süd', holder: 'Altmark Signal GmbH', expires: '2028-05-20' }],
      screening: { run: '2026-11-01', parties: ['Altmark Signal GmbH', 'Jonas Weber'], hits: [] },
      local: { KSA: { entity: 'Altmark Signal Arabia LLC' }, UAE: {} },
      review: { round: 1, scope: null, k1: { by: 'A', at: '2026-07-06', sent: true, outcome: 'qualified', answers: 'all' }, k2: { by: 'B', at: '2026-07-09', answers: 'all' } }
    },
    { id: 'sorell', name: 'Sorell Logistics Ltd', short: 'Sorell Logistics', country: 'Malta', city: 'Valletta', sector: 'logistics', target: ['UAE'],
      applied: '2026-10-19', stage: 'notyet', since: '2026-11-03', owner: 'B', capabilities: [], refs: 1, raising: false,
      contact: 'Mark Azzopardi', decided: '2026-11-03', outcome: 'notyet', reason: 'Licence number not found at the issuing body'
    },
    { id: 'meridian', name: 'Meridian Data Pte. Ltd.', short: 'Meridian Data', country: 'Singapore', city: 'Singapore', sector: 'technology', target: ['UAE', 'Qatar'],
      applied: '2026-09-12', stage: 'qualified', since: '2026-10-09', owner: 'A', capabilities: ['data-platforms', 'cyber-training'], refs: 3, raising: false,
      contact: 'Lim Wei Ling', signatory: 'Lim Wei Ling', decided: '2026-10-09', outcome: 'qualified',
      summary: 'Builds data platforms for utilities and ports: sensor feeds, network models and dashboards for operators. Runs cyber security training for control-room staff.',
      references: ['PUB Singapore network telemetry', 'Port of Rotterdam data hub', '[Third reference]'],
      mark: { id: 'SBC-Q-2026-0008', issued: '2026-10-09', validTo: '2027-10-09', lastScreen: '2026-11-01' },
      reg: { registry: 'Accounting and Corporate Regulatory Authority (ACRA)', number: '201634918K', name: 'Meridian Data Pte. Ltd.', status: 'Live', insolvency: false, incorporated: '2016-11-21', address: '71 Ayer Rajah Crescent, Singapore 139951', directors: ['Lim Wei Ling', 'Arjun Menon'], lastEntry: '2026-07-14', lang: 'English' },
      owners: [{ name: 'Lim Wei Ling', kind: 'person', pct: 60, of: 'self', src: 'official' }, { name: 'Arjun Menon', kind: 'person', pct: 40, of: 'self', src: 'official' }],
      licences: [{ name: 'ISO/IEC 27001:2022', issuer: 'TÜV SÜD PSB', holder: 'Meridian Data Pte. Ltd.', expires: '2028-03-15' }],
      screening: { run: '2026-11-01', parties: ['Meridian Data Pte. Ltd.', 'Lim Wei Ling', 'Arjun Menon'], hits: [] },
      local: { UAE: { agent: '[Agent A] LLC' }, Qatar: {} },
      review: { round: 1, scope: null, k1: { by: 'B', at: '2026-10-07', sent: true, outcome: 'qualified', answers: 'all' }, k2: { by: 'A', at: '2026-10-09', answers: 'all' } }
    },
    { id: 'ferrol', name: 'Ferrol Fire Systems S.L.', short: 'Ferrol Fire Systems', country: 'Spain', city: 'A Coruña', sector: 'construction', target: ['UAE', 'KSA'],
      applied: '2026-08-18', stage: 'qualified', since: '2026-09-24', owner: 'B', capabilities: ['fire-safety'], refs: 7, raising: false,
      contact: 'Marta Iglesias', signatory: 'Marta Iglesias', decided: '2026-09-24', outcome: 'qualified',
      summary: 'Designs, installs and maintains fire detection and suppression for airports, hospitals and towers. Seven Gulf projects since 2019.',
      references: ['Terminal fire suppression, [Gulf airport]', 'Hospital tower, Abu Dhabi', 'Residential towers, Dubai Marina'],
      mark: { id: 'SBC-Q-2026-0007', issued: '2026-09-24', validTo: '2027-09-24', lastScreen: '2026-11-01' },
      reg: { registry: 'Registro Mercantil de A Coruña', number: 'C-48213', name: 'Ferrol Fire Systems S.L.', status: 'Activa', insolvency: false, incorporated: '2003-05-19', address: 'Rúa Gambrinus 22, 15008 A Coruña', directors: ['Marta Iglesias'], lastEntry: '2026-03-02', lang: 'Spanish' },
      owners: [{ name: 'Marta Iglesias', kind: 'person', pct: 70, of: 'self', src: 'official' }, { name: 'Xoán Pereira', kind: 'person', pct: 30, of: 'self', src: 'official' }],
      licences: [{ name: 'ISO 9001:2015', issuer: 'AENOR', holder: 'Ferrol Fire Systems S.L.', expires: '2027-10-30' }, { name: 'UAE Civil Defence approval', issuer: 'UAE Civil Defence', holder: 'Ferrol Fire Systems S.L.', expires: '2027-06-30' }],
      screening: { run: '2026-11-01', parties: ['Ferrol Fire Systems S.L.', 'Marta Iglesias', 'Xoán Pereira'], hits: [] },
      local: { UAE: { entity: 'Ferrol Fire Systems Middle East LLC' }, KSA: {} },
      review: { round: 1, scope: null, k1: { by: 'A', at: '2026-09-22', sent: true, outcome: 'qualified', answers: 'all' }, k2: { by: 'B', at: '2026-09-24', answers: 'all' } }
    },
    { id: 'kaiyo', name: 'Kaiyo Survey K.K.', short: 'Kaiyo Survey', country: 'Japan', city: 'Yokohama', sector: 'marine', target: ['UAE', 'Qatar'],
      applied: '2026-05-20', stage: 'qualified', since: '2026-06-22', owner: 'B', capabilities: ['hydro-survey'], refs: 4, raising: true,
      contact: 'Sato Haruki', signatory: 'Sato Haruki', decided: '2026-06-22', outcome: 'qualified',
      summary: 'Hydrographic and seabed survey for ports, cables and offshore works. Runs its own survey vessels and autonomous boats.',
      references: ['Port approach survey, Yokohama', 'Subsea cable route, [Gulf operator]', 'Dredging survey, Doha'],
      mark: { id: 'SBC-Q-2026-0002', issued: '2026-06-22', validTo: '2027-06-22', lastScreen: '2026-11-01' },
      reg: { registry: 'Yokohama Legal Affairs Bureau', number: '0200-01-041177', name: 'Kaiyo Survey K.K.', status: 'Active', insolvency: false, incorporated: '1998-04-01', address: '2-3 Minatomirai, Nishi-ku, Yokohama', directors: ['Sato Haruki'], lastEntry: '2026-01-20', lang: 'Japanese' },
      owners: [{ name: 'Sato Haruki', kind: 'person', pct: 100, of: 'self', src: 'official' }],
      licences: [{ name: 'ISO 9001:2015', issuer: 'JQA', holder: 'Kaiyo Survey K.K.', expires: '2027-09-01' }],
      screening: { run: '2026-11-01', parties: ['Kaiyo Survey K.K.', 'Sato Haruki'], hits: [] },
      local: { UAE: { agent: '[Agent A] LLC' }, Qatar: { agent: '[Agent E] WLL' } },
      review: { round: 1, scope: null, k1: { by: 'A', at: '2026-06-19', sent: true, outcome: 'qualified', answers: 'all' }, k2: { by: 'B', at: '2026-06-22', answers: 'all' } }
    },
    { id: 'prairie', name: 'Prairie Pipeline Corp.', short: 'Prairie Pipeline', country: 'Canada', city: 'Calgary', sector: 'construction', target: ['KSA', 'Oman'],
      applied: '2026-07-14', stage: 'qualified', since: '2026-08-21', owner: 'A', capabilities: ['pipeline'], refs: 5, raising: true,
      contact: 'Dana Whitford', signatory: 'Dana Whitford', decided: '2026-08-21', outcome: 'qualified',
      summary: 'Builds and rehabilitates water and oil pipelines, with in-house horizontal drilling crews.',
      references: ['Water transmission line, Alberta', 'Pipeline rehabilitation, [Gulf utility]', 'Crossings package, Saskatchewan'],
      mark: { id: 'SBC-Q-2026-0005', issued: '2026-08-21', validTo: '2027-08-21', lastScreen: '2026-11-01' },
      reg: { registry: 'Alberta Corporate Registry', number: '2019384756', name: 'Prairie Pipeline Corp.', status: 'Active', insolvency: false, incorporated: '2008-02-11', address: '840 7 Ave SW, Calgary AB', directors: ['Dana Whitford'], lastEntry: '2026-05-06', lang: 'English' },
      owners: [{ name: 'Dana Whitford', kind: 'person', pct: 55, of: 'self', src: 'official' }, { name: 'Ravi Grewal', kind: 'person', pct: 45, of: 'self', src: 'official' }],
      licences: [{ name: 'ISO 45001:2018', issuer: 'BSI', holder: 'Prairie Pipeline Corp.', expires: '2028-01-31' }],
      screening: { run: '2026-11-01', parties: ['Prairie Pipeline Corp.', 'Dana Whitford', 'Ravi Grewal'], hits: [] },
      local: { KSA: { agent: '[Agent D] Co.' }, Oman: {} },
      review: { round: 1, scope: null, k1: { by: 'B', at: '2026-08-19', sent: true, outcome: 'qualified', answers: 'all' }, k2: { by: 'A', at: '2026-08-21', answers: 'all' } }
    }
  ],

  buyers: [
    { id: 'b-adwu', name: 'Abu Dhabi water utility', type: 'Government', city: 'Abu Dhabi', country: 'UAE', verified: true },
    { id: 'b-rta', name: 'Riyadh transport authority', type: 'Government', city: 'Riyadh', country: 'KSA', verified: true },
    { id: 'b-dmin', name: 'Doha ministry', type: 'Government', city: 'Doha', country: 'Qatar', verified: true },
    { id: 'b-dsd', name: 'Dubai solar developer', type: 'Corporate', city: 'Dubai', country: 'UAE', verified: true },
    { id: 'b-dhg', name: 'Dubai hospital group', type: 'Corporate', city: 'Dubai', country: 'UAE', verified: true },
    { id: 'b-mwa', name: 'Manama water authority', type: 'Government', city: 'Manama', country: 'Bahrain', verified: true },
    { id: 'b-dpo', name: 'Dammam port operator', type: 'Corporate', city: 'Dammam', country: 'KSA', verified: false }
  ],
  investors: [
    { id: 'i-rif', name: 'Riyadh infrastructure fund', type: 'Fund', city: 'Riyadh', country: 'KSA', verified: true },
    { id: 'i-dfo', name: 'Dubai family office', type: 'Family office', city: 'Dubai', country: 'UAE', verified: true },
    { id: 'i-adg', name: 'Abu Dhabi growth fund', type: 'Fund', city: 'Abu Dhabi', country: 'UAE', verified: true },
    { id: 'i-dcv', name: 'Doha corporate venture arm', type: 'Corporate venture', city: 'Doha', country: 'Qatar', verified: false }
  ],

  opps: [
    { id: 'n1', kind: 'need', title: 'Desalination plant maintenance', from: 'b-adwu', country: 'UAE', sector: 'water', capability: 'ro-maintenance',
      value: '[AED value]', posted: '2026-10-27', closes: '2026-11-28', stage: 'approve', source: 'Posted',
      brief: 'Three-year maintenance of a reverse osmosis desalination plant. Bidders hold a UAE licence and have run plants above 50,000 m³ a day.',
      picks: { by: 'B', at: '2026-11-03', ids: ['brunnvik', 'kestrel'] }, approvals: {}, intros: [] },
    { id: 'n2', kind: 'tender', title: 'Rail signalling upgrade', from: 'b-rta', country: 'KSA', sector: 'transport', capability: 'rail-signalling',
      value: '[SAR value]', posted: '2026-10-25', closes: '2026-12-10', stage: 'match', source: 'Official notice',
      brief: 'Signalling upgrade on an urban rail line, with ten years of maintenance. Bidders need a Saudi presence.', intros: [] },
    { id: 'n3', kind: 'need', title: 'Cyber awareness training', from: 'b-dmin', country: 'Qatar', sector: 'technology', capability: 'cyber-training',
      value: '[QAR value]', posted: '2026-10-30', closes: '2026-12-01', stage: 'match', source: 'Posted',
      brief: 'Security awareness training for 4,000 staff, in English and Arabic, over twelve months.', intros: [] },
    { id: 'n4', kind: 'need', title: 'Solar plant O&M', from: 'b-dsd', country: 'UAE', sector: 'energy', capability: 'solar-om',
      value: '[AED value]', posted: '2026-10-08', closes: '2026-11-15', stage: 'introduced', source: 'Posted',
      brief: 'Operation and maintenance for a 120 MW solar plant near Dubai.', released: { by: 'A', at: '2026-10-28' },
      intros: [{ company: 'lumen', status: 'released', at: '2026-10-28' }] },
    { id: 'n5', kind: 'need', title: 'Medical equipment servicing', from: 'b-dhg', country: 'UAE', sector: 'healthcare', capability: 'medical-servicing',
      value: '[AED value]', posted: '2026-11-02', closes: '2026-12-15', stage: 'match', source: 'Posted',
      brief: 'Servicing for imaging and lab equipment across three hospitals.', intros: [] },
    { id: 'n6', kind: 'need', title: 'Water plant audit', from: 'b-mwa', country: 'Bahrain', sector: 'water', capability: 'plant-audit',
      value: '[BHD value]', posted: '2026-08-10', closes: '2026-09-10', stage: 'closed', source: 'Posted',
      brief: 'Independent audit of two water treatment plants.', released: { by: 'B', at: '2026-08-20' },
      intros: [{ company: 'brunnvik', status: 'won', at: '2026-09-22' }] },
    { id: 'm1', kind: 'mandate', title: 'Water and energy growth', from: 'i-rif', country: 'KSA', countries: ['KSA', 'UAE'], sectors: ['water', 'energy'],
      value: '[USD 10M to 25M]', posted: '2026-10-21', closes: '2026-12-31', stage: 'match', source: 'Posted',
      brief: 'Minority stakes in proven suppliers expanding into Saudi Arabia and the UAE.', intros: [] },
    { id: 'm2', kind: 'mandate', title: 'Gulf-bound technology', from: 'i-dfo', country: 'UAE', countries: ['UAE'], sectors: ['technology'],
      value: '[USD 2M to 5M]', posted: '2026-10-26', closes: '2027-01-31', stage: 'match', source: 'Posted',
      brief: 'Early growth technology companies opening in the UAE.', intros: [] },
    { id: 'r1', kind: 'request', title: 'Rooftop solar for terminal buildings', from: 'b-dpo', company: 'lumen', country: 'KSA', sector: 'energy',
      value: '[SAR value]', posted: '2026-11-03', closes: '2026-12-20', stage: 'match', source: 'Directory',
      brief: 'Found Lumen Grid Solar in the directory and asked to meet them.', intros: [] },
    { id: 'n7', kind: 'tender', title: 'RO membrane replacement, Taweelah', from: 'b-adwu', country: 'UAE', sector: 'water', capability: 'membranes', capabilities: ['membranes', 'ro-maintenance'],
      value: '[AED value]', posted: '2026-11-04', closes: '2026-12-04', stage: 'match', source: 'Posted', ref: 'ADWU-T-2026-114', dates: { questions: '2026-11-20', bids: '2026-12-04', opening: '2026-12-07' },
      brief: 'Replace 4,800 RO membrane elements across two trains, inside the planned outage window in February.', intros: [] },
    { id: 'n8', kind: 'need', title: 'Water network leak detection', from: 'b-adwu', country: 'UAE', sector: 'technology', capability: 'data-platforms',
      value: '[AED value]', posted: '2026-11-01', closes: '2026-12-15', stage: 'match', source: 'Posted',
      brief: 'Sensor data and a network model to find leaks on the Al Ain distribution network, then wider.', intros: [] },
    { id: 'r2', kind: 'request', title: 'Water network leak detection', from: 'b-adwu', company: 'meridian', need: 'n8', country: 'UAE', sector: 'technology',
      value: '[AED value]', posted: '2026-11-02', closes: '2026-12-15', stage: 'match', source: 'Directory',
      brief: 'Found Meridian Data in the directory and asked to meet them. Note: pilot on the Al Ain network first.', intros: [] },
    { id: 'n9', kind: 'need', title: 'Solar power for pumping stations', from: 'b-adwu', country: 'UAE', sector: 'energy', capability: 'solar-build',
      value: '[AED value]', posted: '2026-09-20', closes: '2026-11-30', stage: 'introduced', source: 'Posted',
      brief: 'Ground-mounted solar at six pumping stations, with five years of O&M.',
      picks: { by: 'A', at: '2026-10-14', ids: ['lumen'] }, approvals: { lumen: 'approve' }, released: { by: 'B', at: '2026-10-16' },
      intros: [{ company: 'lumen', status: 'meeting', at: '2026-10-20' }] },
    { id: 'n10', kind: 'need', title: 'Pump station energy audit', from: 'b-adwu', country: 'UAE', sector: 'water', capability: 'plant-audit',
      value: '[AED value]', posted: '2026-07-01', closes: '2026-09-12', stage: 'closed', source: 'Posted',
      brief: 'Energy audit of twelve pump stations, with a ranked list of fixes.',
      picks: { by: 'B', at: '2026-07-20', ids: ['brunnvik'] }, approvals: { brunnvik: 'approve' }, released: { by: 'A', at: '2026-07-22' },
      intros: [{ company: 'brunnvik', status: 'won', at: '2026-09-12' }] }
  ],

  agents: [
    { id: 'a1', name: '[Agent A] LLC', city: 'Dubai', country: 'UAE', sectors: ['technology', 'marine'], licenceTo: '2027-03-31', referrals: 12, status: 'active' },
    { id: 'a2', name: '[Agent B] FZE', city: 'Abu Dhabi', country: 'UAE', sectors: ['technology', 'healthcare'], licenceTo: '2027-01-31', referrals: 4, status: 'active' },
    { id: 'a3', name: '[Agent C] LLC', city: 'Dubai', country: 'UAE', sectors: ['water', 'energy'], licenceTo: '2026-12-31', referrals: 9, status: 'active' },
    { id: 'a4', name: '[Agent D] Co.', city: 'Riyadh', country: 'KSA', sectors: ['construction', 'transport', 'energy'], licenceTo: '2027-08-31', referrals: 6, status: 'active' },
    { id: 'a5', name: '[Agent E] WLL', city: 'Doha', country: 'Qatar', sectors: ['energy', 'technology'], licenceTo: '2027-06-30', referrals: 2, status: 'active' },
    { id: 'a6', name: '[Agent F] LLC', city: 'Muscat', country: 'Oman', sectors: ['water'], licenceTo: null, referrals: 0, status: 'review' }
  ],

  audit: [
    { t: '2026-11-04T08:40', who: 'buyer', action: 'Posted a tender', file: 'n7', detail: 'RO membrane replacement, Taweelah', tag: 'change' },
    { t: '2026-11-02T13:15', who: 'buyer', action: 'Asked for an introduction', file: 'r2', detail: 'Meridian Data · from the directory', tag: 'change' },
    { t: '2026-11-01T10:05', who: 'buyer', action: 'Posted a need', file: 'n8', detail: 'Water network leak detection', tag: 'change' },
    { t: '2026-11-04T09:12', who: 'rules', action: 'Ran the five checks', file: 'varun', detail: 'Screening · 1 hit', tag: 'rules', ver: 'v1.0' },
    { t: '2026-11-04T08:55', who: 'rules', action: 'Monthly screening', file: 'brunnvik', detail: 'Clear', tag: 'rules', ver: 'v1.0' },
    { t: '2026-11-03T16:20', who: 'company', action: 'Uploaded 2 documents', file: 'halvorsen', detail: 'New version', tag: 'change', ver: 'v3' },
    { t: '2026-11-03T16:18', who: 'rules', action: 'Ran the five checks', file: 'aquamar', detail: 'Readiness · officer', tag: 'rules', ver: 'v1.0' },
    { t: '2026-11-03T15:02', who: 'B', action: 'Picked 2 matches', file: 'n1', detail: 'Key 1', tag: 'sign', ver: '' },
    { t: '2026-11-03T14:31', who: 'A', action: 'Signed key 1', file: 'pacifica', detail: 'Proposed: SBC-Qualified', tag: 'sign', ver: 'v2' },
    { t: '2026-11-03T11:05', who: 'B', action: 'Signed key 2', file: 'sorell', detail: 'Not yet', tag: 'sign', ver: 'v2' },
    { t: '2026-11-02T10:40', who: 'A', action: 'Signed key 2', file: 'lumen', detail: 'SBC-Qualified', tag: 'sign', ver: 'v3' },
    { t: '2026-11-02T10:41', who: 'rules', action: 'Issued the mark', file: 'lumen', detail: 'SBC-Q-2026-0009', tag: 'change', ver: '' },
    { t: '2026-11-02T09:30', who: 'A', action: 'Took the file', file: 'halvorsen', detail: 'Assigned', tag: 'change', ver: 'v2' },
    { t: '2026-11-02T09:02', who: 'rules', action: 'Ran the five checks', file: 'halvorsen', detail: 'Ownership, screening, readiness · officer', tag: 'rules', ver: 'v1.0' },
    { t: '2026-10-30T13:15', who: 'A', action: 'Signed key 2', file: 'orrin', detail: 'Conditionally Qualified', tag: 'sign', ver: 'v2' },
    { t: '2026-10-30T13:16', who: 'B', action: 'Sent the action plan', file: 'orrin', detail: '2 items · due 13 Nov', tag: 'change', ver: '' },
    { t: '2026-10-29T17:40', who: 'B', action: 'Signed key 1', file: 'northgate', detail: 'Proposed: SBC-Qualified', tag: 'sign', ver: 'v2' },
    { t: '2026-10-28T11:20', who: 'A', action: 'Released introduction', file: 'n4', detail: 'Lumen Grid Solar', tag: 'sign', ver: '' }
  ]
};
