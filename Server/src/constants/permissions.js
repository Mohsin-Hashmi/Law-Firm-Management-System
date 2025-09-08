module.exports = {
  // Firms
  CREATE_FIRM: "create_firm",
  UPDATE_FIRM: "update_firm",
  DELETE_FIRM: "delete_firm",

  // Stats
  VIEW_STATS: "view_stats",

  // Lawyers (CRUD)
  CREATE_LAWYER: "create_lawyer",
  READ_LAWYER: "read_lawyer",
  UPDATE_LAWYER: "update_lawyer",
  DELETE_LAWYER: "delete_lawyer",

  // Clients (CRUD)
  CREATE_CLIENT: "create_client",
  READ_CLIENT: "read_client",
  UPDATE_CLIENT: "update_client",
  DELETE_CLIENT: "delete_client",

  // Roles
  CREATE_ROLE: "create_role",
   ASSIGN_ROLE: "assign_role",

  // Cases (CRUD + Law Firm specific actions)
  CREATE_CASE: "create_case",
  READ_CASE: "read_case",
  UPDATE_CASE: "update_case",
  DELETE_CASE: "delete_case",

  // Case-specific actions
  VIEW_CASE_STATUS: "view_case_status",
  UPDATE_CASE_STATUS: "update_case_status",
  ASSIGN_LAWYER_TO_CASE: "assign_lawyer_to_case",
  VIEW_CASE_DOCUMENTS: "view_case_documents",
  UPLOAD_CASE_DOCUMENT: "upload_case_document",
  DELETE_CASE_DOCUMENT: "delete_case_document",
};
