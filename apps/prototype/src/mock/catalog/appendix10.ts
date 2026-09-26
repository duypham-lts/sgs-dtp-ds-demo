// Appendix 10 (Security Baselines for ICT Systems, MODA) as imported in designs/04: 7 dimensions,
// 27 control measures, 79 requirements in the amended version (Basic 44 · Medium +17 · High +18) and 76 in
// the 2022 version (3 High requirements fewer). Some tiers follow the requirements that designs/05 and 08 show
// in a Medium workspace (R.3.2.2, R.4.1.2, R.5.3.4, R.5.4.2); others moved up to keep 44 / 17 / 18. Titles shown in designs/04, 05 and 08 are used verbatim;
// the other titles and statements are sample content written for the prototype.
// Row: [code, title, minimum tier, statement, expected evidence name]
export type Row = [string, string, 'P' | 'M' | 'H', string, string];
export interface Measure { code: string; title: string; rows: Row[] }
export interface Dimension { code: string; title: string; measures: Measure[] }

export const APPENDIX10: Dimension[] = [
  { code: '1', title: 'Access Control', measures: [
    { code: '1.1', title: 'Account management', rows: [
      ['R.1.1.1', 'Establish an account management mechanism', 'P', 'Establish an account management mechanism, including procedures for account application, creation, modification, activation, deactivation, and deletion.', 'Account Management Procedure'],
      ['R.1.1.2', 'Delete or disable expired temporary accounts', 'P', 'Temporary and emergency accounts shall be deleted or disabled when they expire.', 'Temporary Account Review Record'],
      ['R.1.1.3', 'Disable inactive accounts automatically', 'M', 'Accounts that have not been used for a defined period shall be disabled automatically.', 'Inactive Account Disablement Configuration'],
      ['R.1.1.4', 'Review account lifecycle periodically', 'M', 'The need for each account shall be reviewed at a defined interval.', 'Periodic Account Review Report'],
      ['R.1.1.5', 'Log out idle sessions automatically', 'P', 'Sessions shall end automatically after a defined period of inactivity.', 'Session Timeout Configuration'],
      ['R.1.1.6', 'Restrict use of shared accounts', 'P', 'Shared accounts shall only be used where individual accounts are not possible, with approval.', 'Shared Account Register'],
      ['R.1.1.7', 'Notify owners of account changes', 'H', 'Account owners and administrators shall be notified when an account is created, changed or disabled.', 'Account Change Notification Log'],
      ['R.1.1.8', 'Monitor and report abnormal account use', 'H', 'Abnormal use of accounts shall be detected and reported to the responsible staff.', 'Abnormal Account Use Alerts'],
    ] },
    { code: '1.2', title: 'Least privilege', rows: [
      ['R.1.2.1', 'Least privilege', 'M', 'Users and processes shall only have the access rights needed for their tasks.', 'Least Privilege Access Matrix'],
      ['R.1.2.2', 'Separate duties of privileged accounts', 'H', 'Privileged functions shall be split so that no single account controls a critical process end to end.', 'Segregation of Duties Review'],
    ] },
    { code: '1.3', title: 'Remote access', rows: [
      ['R.1.3.1', 'Authorise remote access', 'P', 'Remote access shall be authorised before use and limited to approved users.', 'Remote Access Approval Records'],
      ['R.1.3.2', 'Monitor remote connections', 'P', 'Remote connections shall be logged and monitored.', 'Remote Connection Logs'],
      ['R.1.3.3', 'Restrict remote access to managed entry points', 'P', 'Remote access shall only go through managed access points.', 'Network Access Point Diagram'],
      ['R.1.3.4', 'Encrypt remote sessions', 'M', 'Remote sessions shall be protected with encryption.', 'VPN Encryption Settings'],
    ] },
  ] },
  { code: '2', title: 'Event Logging and Accountability', measures: [
    { code: '2.1', title: 'Record events', rows: [
      ['R.2.1.1', 'Log retention', 'P', 'Logs shall be kept for at least six months, or longer where the law requires.', 'Log Retention Policy'],
      ['R.2.1.2', 'Define the events to record', 'P', 'The security events that the system records shall be defined.', 'Logged Events Specification'],
      ['R.2.1.3', 'Review the event list periodically', 'P', 'The list of recorded events shall be reviewed at a defined interval.', 'Event List Review Record'],
    ] },
    { code: '2.2', title: 'Log content', rows: [
      ['R.2.2.1', 'Record time, source, user and result of each event', 'P', 'Each log entry shall contain the time, source, user identity and result of the event.', 'Sample Log Extract'],
      ['R.2.2.2', 'Record the target object of each event', 'P', 'Log entries shall identify the object the event concerns.', 'Log Field Mapping'],
    ] },
    { code: '2.3', title: 'Log storage and logging failures', rows: [
      ['R.2.3.1', 'Allocate enough log storage', 'P', 'Enough storage shall be allocated to keep logs for the retention period.', 'Log Storage Capacity Plan'],
      ['R.2.3.2', 'Alert before storage runs out', 'P', 'Staff shall be alerted before log storage runs out.', 'Storage Alert Configuration'],
      ['R.2.3.3', 'Take action when logging fails', 'P', 'Defined actions shall be taken when logging fails.', 'Logging Failure Procedure'],
      ['R.2.3.4', 'Alert in real time on logging failure', 'H', 'Logging failures shall raise a real-time alert.', 'Real-time Logging Alerts'],
    ] },
    { code: '2.5', title: 'Time stamps', rows: [
      ['R.2.5.1', 'Use system clocks for time stamps', 'P', 'Time stamps shall come from the system clock.', 'Time Stamp Configuration'],
      ['R.2.5.2', 'Synchronise clocks with a trusted source', 'M', 'System clocks shall be synchronised with a trusted time source.', 'NTP Synchronisation Settings'],
    ] },
    { code: '2.6', title: 'Protection of log information', rows: [
      ['R.2.6.1', 'Protect logs from unauthorised access', 'P', 'Only authorised staff shall be able to read or change logs.', 'Log Access Permissions'],
      ['R.2.6.2', 'Integrity of logs', 'M', 'The integrity of logs shall be protected, for example with hashing or write-once storage.', 'Log Integrity Controls'],
      ['R.2.6.3', 'Back up logs to a separate system', 'H', 'Logs shall be backed up to a system separate from the one that produced them.', 'Log Backup Records'],
    ] },
  ] },
  { code: '3', title: 'Business Continuity Plan', measures: [
    { code: '3.1', title: 'Data backup', rows: [
      ['R.3.1.1', 'Tolerable data loss', 'P', 'The tolerable data loss for the system shall be defined.', 'Recovery Point Objective Statement'],
      ['R.3.1.2', 'Perform data backup', 'P', 'Data shall be backed up according to the tolerable data loss.', 'Backup Schedule and Logs'],
      ['R.3.1.3', 'Periodically test backup reliability and integrity', 'M', 'Backup data shall be tested periodically to verify the reliability of backup media and the integrity of information.', 'Backup Restore Test Report'],
      ['R.3.1.4', 'Store backups off site', 'H', 'Backups of critical data shall be kept at a separate site.', 'Off-site Backup Records'],
      ['R.3.1.5', 'Protect backups with encryption', 'H', 'Backups shall be encrypted.', 'Backup Encryption Settings'],
    ] },
    { code: '3.2', title: 'System redundancy', rows: [
      ['R.3.2.1', 'Define recovery time objectives', 'H', 'The maximum tolerable downtime of the system shall be defined.', 'Recovery Time Objective Statement'],
      ['R.3.2.2', 'Test redundancy failover', 'M', 'Failover to redundant systems shall be tested.', 'Failover Test Report'],
      ['R.3.2.3', 'Provide redundant systems for critical services', 'H', 'Critical services shall have redundant systems.', 'Redundancy Architecture'],
    ] },
  ] },
  { code: '4', title: 'Identification and Authentication', measures: [
    { code: '4.1', title: 'Internal users', rows: [
      ['R.4.1.1', 'Identify users', 'P', 'Each internal user shall be uniquely identified.', 'User Identity Register'],
      ['R.4.1.2', 'Adopt multi-factor authentication', 'M', 'Privileged and remote access shall use multi-factor authentication.', 'MFA Configuration'],
    ] },
    { code: '4.2', title: 'Authenticator management', rows: [
      ['R.4.2.1', 'Change default passwords before use', 'P', 'Default passwords shall be changed before a system is used.', 'Default Password Checklist'],
      ['R.4.2.2', 'Enforce password complexity', 'P', 'Passwords shall meet defined length and complexity rules.', 'Password Policy Settings'],
      ['R.4.2.3', 'Limit failed sign-in attempts', 'P', 'Accounts shall be locked after a defined number of failed sign-in attempts.', 'Account Lockout Settings'],
      ['R.4.2.4', 'Prevent reuse of recent passwords', 'P', 'Users shall not be able to reuse recent passwords.', 'Password History Settings'],
      ['R.4.2.5', 'Require password change at intervals', 'H', 'Passwords shall be changed at a defined interval or when compromise is suspected.', 'Password Expiry Settings'],
    ] },
    { code: '4.3', title: 'Authentication feedback', rows: [
      ['R.4.3.1', 'Mask authentication information', 'P', 'Authentication information shall be masked while it is entered.', 'Sign-in Screen Evidence'],
    ] },
    { code: '4.4', title: 'Cryptographic module authentication', rows: [
      ['R.4.4.1', 'Use validated cryptographic modules', 'M', 'Authentication to cryptographic modules shall follow the applicable standards.', 'Cryptographic Module Certificates'],
    ] },
    { code: '4.5', title: 'Non-internal users', rows: [
      ['R.4.5.1', 'Identify non-internal users', 'P', 'Users outside the organisation shall be uniquely identified.', 'External User Register'],
      ['R.4.5.2', 'Authenticate external services', 'M', 'External services that connect to the system shall be authenticated.', 'Service Authentication Settings'],
    ] },
  ] },
  { code: '5', title: 'System and Service Acquisition', measures: [
    { code: '5.1', title: 'Requirements phase', rows: [
      ['R.5.1.1', 'Security requirements', 'P', 'Security requirements shall be defined when a system is planned.', 'Security Requirements Specification'],
    ] },
    { code: '5.2', title: 'Design phase', rows: [
      ['R.5.2.1', 'Threat modelling of the system design', 'M', 'The system design shall be analysed for threats.', 'Threat Model'],
      ['R.5.2.2', 'Security architecture review', 'H', 'The security architecture shall be reviewed before development.', 'Architecture Review Minutes'],
    ] },
    { code: '5.3', title: 'Development phase', rows: [
      ['R.5.3.1', 'Secure coding standard', 'P', 'Developers shall follow a secure coding standard.', 'Secure Coding Standard'],
      ['R.5.3.2', 'Manage open-source components', 'H', 'Open-source components shall be inventoried and kept up to date.', 'Software Bill of Materials'],
      ['R.5.3.3', 'Protect source code', 'P', 'Access to source code shall be controlled.', 'Repository Access Settings'],
      ['R.5.3.4', 'Source code scanning', 'M', 'Source code shall be scanned for security flaws.', 'Source Code Scan Report'],
    ] },
    { code: '5.4', title: 'Testing phase', rows: [
      ['R.5.4.1', 'Perform vulnerability scanning', 'P', 'The system shall be scanned for vulnerabilities before release.', 'Vulnerability Scan Report'],
      ['R.5.4.2', 'Penetration testing', 'M', 'The system shall be penetration tested before release and after major changes.', 'Penetration Test Report'],
    ] },
    { code: '5.5', title: 'Deployment and maintenance', rows: [
      ['R.5.5.1', 'Harden the deployment environment', 'P', 'The production environment shall be hardened according to a baseline.', 'Hardening Checklist'],
      ['R.5.5.2', 'Manage configuration changes', 'P', 'Changes to the production configuration shall be approved and recorded.', 'Change Records'],
      ['R.5.5.3', 'Remove test data before go-live', 'P', 'Test data and accounts shall be removed before the system goes live.', 'Go-live Checklist'],
      ['R.5.5.4', 'Keep system documentation up to date', 'P', 'System documentation shall be kept up to date.', 'System Documentation'],
    ] },
    { code: '5.6', title: 'Outsourcing', rows: [
      ['R.5.6.1', 'Include security requirements in outsourcing contracts', 'P', 'Outsourcing contracts shall include the security requirements of this baseline.', 'Outsourcing Contract Clauses'],
      ['R.5.6.2', 'Review supplier security', 'H', 'The security of suppliers shall be reviewed at a defined interval.', 'Supplier Security Review'],
    ] },
  ] },
  { code: '6', title: 'System and Communication Protection', measures: [
    { code: '6.1', title: 'Transmission confidentiality and integrity', rows: [
      ['R.6.1.1', 'Encrypt transmission', 'M', 'Data transmitted over networks shall be encrypted.', 'TLS Configuration'],
      ['R.6.1.2', 'Use current encryption protocols', 'M', 'Only current, secure encryption protocols and algorithms shall be used.', 'Cipher Suite Settings'],
      ['R.6.1.3', 'Manage cryptographic keys', 'H', 'Cryptographic keys shall be generated, stored, rotated and destroyed securely.', 'Key Management Procedure'],
    ] },
    { code: '6.2', title: 'Data at rest', rows: [
      ['R.6.2.1', 'Encrypt sensitive stored data', 'H', 'Sensitive data shall be encrypted when stored.', 'Storage Encryption Settings'],
      ['R.6.2.2', 'Protect storage media', 'P', 'Storage media shall be protected and securely disposed of.', 'Media Disposal Records'],
    ] },
    { code: '6.3', title: 'Boundary protection', rows: [
      ['R.6.3.1', 'Separate network zones', 'P', 'Networks shall be separated into zones by function and sensitivity.', 'Network Zoning Diagram'],
      ['R.6.3.2', 'Filter traffic at the boundary', 'H', 'Traffic at network boundaries shall be filtered by rules that are reviewed regularly.', 'Firewall Rule Review'],
    ] },
  ] },
  { code: '7', title: 'System and Information Integrity', measures: [
    { code: '7.1', title: 'Flaw remediation', rows: [
      ['R.7.1.1', 'Fix vulnerabilities', 'P', 'Vulnerabilities shall be tested and fixed within defined time frames.', 'Patch Management Records'],
      ['R.7.1.2', 'Track remediation deadlines', 'P', 'Deadlines for fixing vulnerabilities shall be tracked.', 'Remediation Tracker'],
      ['R.7.1.3', 'Automate flaw scanning', 'P', 'Scanning for flaws shall be automated.', 'Automated Scan Schedule'],
    ] },
    { code: '7.2', title: 'System monitoring', rows: [
      ['R.7.2.1', 'Monitor the information system', 'P', 'The system shall be monitored for attacks and unauthorised use.', 'Monitoring Dashboard'],
      ['R.7.2.2', 'Detect intrusions automatically', 'M', 'Intrusions shall be detected automatically.', 'IDS Configuration'],
      ['R.7.2.3', 'Correlate monitoring alerts', 'H', 'Alerts from monitoring tools shall be correlated centrally.', 'SIEM Correlation Rules'],
    ] },
    { code: '7.3', title: 'Software and information integrity', rows: [
      ['R.7.3.1', 'Check software integrity', 'P', 'The integrity of installed software shall be checked.', 'Integrity Check Results'],
      ['R.7.3.2', 'Verify integrity of updates', 'P', 'Updates shall be verified before they are installed.', 'Update Verification Records'],
      ['R.7.3.3', 'Alert on unauthorised changes', 'H', 'Unauthorised changes to software or information shall raise an alert.', 'Change Detection Alerts'],
      ['R.7.3.4', 'Protect against malware', 'P', 'Systems shall be protected against malicious code.', 'Anti-malware Settings'],
    ] },
  ] },
];

/** High requirements added by the amended version (not in 2022). */
export const AMENDED_ONLY = new Set(['R.3.1.5', 'R.5.2.2', 'R.7.2.3']);
