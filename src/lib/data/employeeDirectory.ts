import { currentEmployee } from "@/lib/data/employee";

export interface EmployeeProfile {
  name: string;
  id: string;
  department: string;
  email: string;
  jobTitle: string;
  location: string;
}

/** Mock HR directory details for seed employees (job title + location). */
const DIRECTORY: Record<string, { jobTitle: string; location: string }> = {
  "Aarav Mehta": { jobTitle: "Senior Software Engineer", location: "Bengaluru, IN" },
  "Neha Gupta": { jobTitle: "Account Executive", location: "Mumbai, IN" },
  "Arjun Rao": { jobTitle: "Financial Analyst", location: "Hyderabad, IN" },
  "Kavya Nair": { jobTitle: "Marketing Specialist", location: "Bengaluru, IN" },
  "Rahul Iyer": { jobTitle: "Operations Associate", location: "Pune, IN" },
  "Sneha Verma": { jobTitle: "Product Designer", location: "Remote, IN" },
  "Aditya Kulkarni": { jobTitle: "Software Engineer", location: "Pune, IN" },
  "Meera Joshi": { jobTitle: "Support Specialist", location: "Chennai, IN" },
  "Karthik Menon": { jobTitle: "Product Manager", location: "Bengaluru, IN" },
  "Divya Pillai": { jobTitle: "Sales Development Rep", location: "Kochi, IN" },
};

function emailFor(name: string): string {
  if (name === currentEmployee.name) return currentEmployee.email;
  const slug = name.trim().toLowerCase().replace(/\s+/g, ".");
  return `${slug}@heizen.work`;
}

/** Build a compact employee profile from the fields carried on the ticket record. */
export function getEmployeeProfile(name: string, id: string, department: string): EmployeeProfile {
  const extra = DIRECTORY[name] ?? { jobTitle: "Employee", location: "India" };
  return { name, id, department, email: emailFor(name), ...extra };
}
