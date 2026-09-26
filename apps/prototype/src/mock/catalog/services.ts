// Service catalogue of docs/book-a-service.md as shown in designs/09 (13 certification services).
export const CERT_SERVICES = [
  { std: 'ISO/IEC 42001', name: 'Artificial Intelligence Management System', zh: '人工智慧管理系統', code: 'ISO_IEC_42001' },
  { std: 'ISO/IEC 27001', name: 'Information Security Management System', zh: '資訊安全管理系統', code: 'ISO_IEC_27001' },
  { std: 'ISO/IEC 27701', name: 'Privacy Information Management System', zh: '隱私資訊管理系統', code: 'ISO_IEC_27701' },
  { std: 'ISO/IEC 27017', name: 'Information security for cloud services', zh: '雲服務資訊安全' },
  { std: 'ISO/IEC 27018', name: 'Protection of PII in public clouds', zh: '雲服務個資保護' },
  { std: 'ISO 22301', name: 'Business Continuity Management System', zh: '營運持續管理系統', code: 'ISO_22301' },
  { std: 'ISO 56001', name: 'Innovation Management System', zh: '創新管理系統' },
  { std: 'ISO/IEC 20000', name: 'Service Management System', zh: '服務管理系統' },
  { std: 'NIST CSF', name: 'Cybersecurity Framework', zh: '網路安全框架' },
  { std: 'Cybersecurity Management Act', name: 'Certification Scheme', zh: '資通安全管理法驗證方案', code: 'TW_ISRM_ANNEX10_EN' },
  { std: 'TISAX', name: 'Trusted Information Security Assessment Exchange', zh: '可信任資訊安全評鑑', code: 'TISAX_VDA_ISA' },
  { std: 'ASPICE', name: 'Automotive SPICE capability assessment', zh: '汽車產業軟體流程改進與能力測定標準' },
  { std: 'Second-party audit', name: 'Supply chain audit', zh: '供應鏈二者稽核服務' },
] as { std: string; name: string; zh: string; code?: string }[];

export const CERT_TYPES = ['Initial certification', 'Recertification', 'Transfer from another body'] as const;
/** Audit periods offered in designs/08 Main and 09 CertRequest, merged. */
export const AUDIT_PERIODS = ['November 2026', 'December 2026', 'Q1 2027', 'Q2 2027', 'Not sure yet'];

/** SGS Academy courses of docs/book-a-service.md as shown in designs/09 TrainList (33). */
export const TRAINING_COURSES: { id: string; course: string; std: string; cat: string }[] = [
  { id: 't0', course: "Lead Auditor Training Course", std: "ISO/IEC 42001", cat: "AI" },
  { id: 't1', course: "Lead Auditor Conversion Training Course", std: "ISO/IEC 42001", cat: "AI" },
  { id: 't2', course: "Internal Auditor Training Course", std: "ISO/IEC 42001", cat: "AI" },
  { id: 't3', course: "Standard Analysis Training Course", std: "ISO/IEC 42001", cat: "AI" },
  { id: 't4', course: "Core concepts (ISO/IEC 22989)", std: "Practical courses", cat: "AI" },
  { id: 't5', course: "Data management", std: "Practical courses", cat: "AI" },
  { id: 't6', course: "Risk and cybersecurity", std: "Practical courses", cat: "AI" },
  { id: 't7', course: "Lead Auditor Training Course", std: "ISO/IEC 27001", cat: "Information Security" },
  { id: 't8', course: "Lead Auditor Conversion Training Course", std: "ISO/IEC 27001", cat: "Information Security" },
  { id: 't9', course: "Lead Auditor Transition Training Course", std: "ISO/IEC 27001", cat: "Information Security" },
  { id: 't10', course: "Internal Auditor Training Course", std: "ISO/IEC 27001", cat: "Information Security" },
  { id: 't11', course: "Standard Analysis Training Course", std: "ISO/IEC 27001", cat: "Information Security" },
  { id: 't12', course: "Lead Auditor Conversion Training Course", std: "ISO/IEC 27017", cat: "Information Security" },
  { id: 't13', course: "Lead Auditor Transition Training Course", std: "ISO/IEC 27017", cat: "Information Security" },
  { id: 't14', course: "Lead Auditor Training Course", std: "NIST CSF", cat: "Information Security" },
  { id: 't15', course: "Implementation Training Course", std: "NIST CSF", cat: "Information Security" },
  { id: 't16', course: "Security baselines – practical", std: "Cybersecurity Management Act", cat: "Information Security" },
  { id: 't17', course: "Lead Auditor Training Course", std: "TISAX", cat: "Information Security" },
  { id: 't18', course: "Standard Analysis Training Course", std: "TISAX", cat: "Information Security" },
  { id: 't19', course: "Implementation Training Course", std: "TISAX", cat: "Information Security" },
  { id: 't20', course: "Internal Auditor Training Course", std: "ASPICE", cat: "Information Security" },
  { id: 't21', course: "Standard Analysis Training Course", std: "ASPICE", cat: "Information Security" },
  { id: 't22', course: "Lead Auditor Training Course", std: "ISO/IEC 27701", cat: "Privacy Protection" },
  { id: 't23', course: "Lead Auditor Conversion Training Course", std: "ISO/IEC 27701", cat: "Privacy Protection" },
  { id: 't24', course: "Lead Auditor Transition Training Course", std: "ISO/IEC 27701", cat: "Privacy Protection" },
  { id: 't25', course: "Lead Auditor Conversion Training Course", std: "ISO/IEC 27018", cat: "Privacy Protection" },
  { id: 't26', course: "Lead Auditor Transition Training Course", std: "ISO/IEC 27018", cat: "Privacy Protection" },
  { id: 't27', course: "Lead Auditor Training Course", std: "ISO 22301", cat: "Business Continuity" },
  { id: 't28', course: "Lead Auditor Transition Training Course", std: "ISO 22301", cat: "Business Continuity" },
  { id: 't29', course: "Internal Auditor Training Course", std: "ISO 22301", cat: "Business Continuity" },
  { id: 't30', course: "Standard Analysis Training Course", std: "ISO 22301", cat: "Business Continuity" },
  { id: 't31', course: "Lead Auditor Conversion Training Course", std: "ISO 56001", cat: "Business Governance" },
  { id: 't32', course: "Lead Auditor Training Course", std: "ISO/IEC 20000", cat: "Business Governance" },
];
export const TRAINING_FORMATS = ['Public class', 'In-house', 'Online'] as const;
export const TRAINING_MONTHS = ['October 2026', 'November 2026', 'December 2026', 'Flexible'];
export const TRAINING_LANGUAGES = ['繁體中文', 'English'] as const;
/** "ISO/IEC 27001 Lead Auditor Training Course" → short "ISO/IEC 27001 Lead Auditor" (designs/09). */
export const courseTitle = (std: string, course: string, short = false) => `${std === 'Practical courses' ? '' : `${std} `}${short ? course.replace(/ Training Course$/, '') : course}`;
