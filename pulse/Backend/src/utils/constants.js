export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  COORDINATOR: 'COORDINATOR',
  VOLUNTEER: 'VOLUNTEER',
};

export const ROLE_HIERARCHY = ['VOLUNTEER', 'COORDINATOR', 'ADMIN', 'SUPER_ADMIN'];

export const TASK_PRIORITIES = ['Low', 'Medium', 'High'];
export const TASK_STATUSES = ['Open', 'In Progress', 'Resolved'];

export const DEFAULT_TASK_PRIORITY = 'Medium';
export const DEFAULT_TASK_STATUS = 'Open';

export const INCIDENT_SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];
export const INCIDENT_STATUSES = ['Open', 'Acknowledged', 'Escalated', 'Resolved'];

export const DEFAULT_INCIDENT_SEVERITY = 'Medium';
export const DEFAULT_INCIDENT_STATUS = 'Open';

export const ANNOUNCEMENT_PRIORITIES = ['Normal', 'Urgent'];
export const ANNOUNCEMENT_AUDIENCES = ['Everyone', 'Zone', 'Role'];
export const ANNOUNCEMENT_STATUSES = ['Draft', 'Published'];

export const DEFAULT_ANNOUNCEMENT_PRIORITY = 'Normal';
export const DEFAULT_ANNOUNCEMENT_AUDIENCE = 'Everyone';
export const DEFAULT_ANNOUNCEMENT_STATUS = 'Published';
