'use client';

import { useState } from 'react';

const INITIAL_LETTERS = [
  { id: 'let1', empName: "Sneha Reddy", type: "Appointment Letter", date: "2026-09-01", status: "Issued" },
  { id: 'let2', empName: "Aisha Khan", type: "Increment / Appraisal Letter", date: "2026-04-01", status: "Issued" },
  { id: 'let3', empName: "James Wilson", type: "Confirmation Letter", date: "2026-06-15", status: "Issued" },
];

export default function LettersPage() {
  const [letters] = useState(INITIAL_LETTERS);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState(null);

  const handlePreview = (l) => {
    setSelectedLetter(l);
    setPreviewOpen(true);
  };

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <h1 className="page-title">HR Letters & Documentation</h1>
        </div>
        <div className="topbar-right">
          <button className="btn btn-primary" onClick={() => alert('New Letter Generator')}>
            + Generate Letter
          </button>
        </div>
      </header>

      <div className="content">
        <div className="card">
          <div className="card-header">
            <h2>Generated Company Letters</h2>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Letter Type</th>
                  <th>Date Issued</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {letters.map((l) => (
                  <tr key={l.id}>
                    <td><strong>{l.empName}</strong></td>
                    <td>{l.type}</td>
                    <td>{l.date}</td>
                    <td><span className="badge badge-success">{l.status}</span></td>
                    <td>
                      <div className="btn-group">
                        <button className="btn btn-outline btn-sm" onClick={() => handlePreview(l)}>View / Print</button>
                        <button className="btn btn-outline btn-sm">Download PDF</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {previewOpen && selectedLetter && (
          <div className="modal-backdrop show">
            <div className="modal modal-lg">
              <div className="modal-header">
                <h3>{selectedLetter.type} – {selectedLetter.empName}</h3>
                <button className="modal-close" onClick={() => setPreviewOpen(false)}>×</button>
              </div>
              <div className="modal-body">
                <div className="letter-paper">
                  <div className="lh">
                    <div className="logo-icon logo-img">RA</div>
                    <div>
                      <div className="lh-name">R &amp; A ASSOCIATES</div>
                      <div className="lh-sub">Company Secretaries &amp; Corporate Legal Advisors</div>
                    </div>
                  </div>
                  <div className="l-meta">
                    <div>Ref: RA/HR/2026/089</div>
                    <div>Date: {selectedLetter.date}</div>
                  </div>
                  <p>Dear <strong>{selectedLetter.empName}</strong>,</p>
                  <p>
                    We are pleased to issue your formal <strong>{selectedLetter.type}</strong> on behalf of R &amp; A Associates.
                    Your dedication and commitment to the organisation are greatly appreciated.
                  </p>
                  <p>
                    Please find all terms, benefits, and statutory guidelines outlined in accordance with the firm's standard policy manual.
                  </p>
                  <div className="l-sign">
                    <p>Yours sincerely,</p>
                    <p><strong>For R &amp; A Associates</strong></p>
                    <div className="l-stamp">AUTHORIZED SIGNATORY</div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline" onClick={() => setPreviewOpen(false)}>Close</button>
                <button className="btn btn-primary" onClick={() => window.print()}>🖨️ Print Letter</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
