export const demoDocuments = [
  {
    id: 501,
    caseId: 401,
    fileName: "estate-inventory-summary.pdf",
    fileType: "application/pdf",
    filePath: "demo-documents/estate-inventory-summary.pdf",
    uploadedById: 1,
    uploadedByType: "Firm Admin",
    createdAt: "2026-04-05T14:30:00.000Z",
  },
  {
    id: 502,
    caseId: 402,
    fileName: "vendor-contract-review.pdf",
    fileType: "application/pdf",
    filePath: "demo-documents/vendor-contract-review.pdf",
    uploadedById: 201,
    uploadedByType: "Lawyer",
    createdAt: "2026-05-13T09:20:00.000Z",
  },
  {
    id: 503,
    caseId: 403,
    fileName: "employment-policy-notes.docx",
    fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    filePath: "demo-documents/employment-policy-notes.docx",
    uploadedById: 204,
    uploadedByType: "Lawyer",
    createdAt: "2026-06-01T16:10:00.000Z",
  },
  {
    id: 504,
    caseId: 407,
    fileName: "supplier-agreement-redline.pdf",
    fileType: "application/pdf",
    filePath: "demo-documents/supplier-agreement-redline.pdf",
    uploadedById: 1,
    uploadedByType: "Firm Admin",
    createdAt: "2026-07-22T11:45:00.000Z",
  },
];

export const getDemoDocumentsByCase = (caseId: number | string) =>
  demoDocuments.filter((document) => document.caseId === Number(caseId));
