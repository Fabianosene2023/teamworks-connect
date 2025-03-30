
// Department types
export type DepartmentType = {
  id: string;
  name: string;
  created_at: string;
};

// Predefined departments
export const PREDEFINED_DEPARTMENTS = [
  { name: 'TI' },
  { name: 'Iniciação profissional' },
  { name: 'Probem' },
  { name: 'Gestão' },
  { name: 'Contabilidade' },
  { name: 'NEJ' }
];

// Check if user is admin
export const isAdmin = (userEmail: string | undefined): boolean => {
  if (!userEmail) return false;
  
  // List of admin emails - this should be moved to the database in a production environment
  const adminEmails = ['admin@team.com'];
  return adminEmails.includes(userEmail.toLowerCase());
};
