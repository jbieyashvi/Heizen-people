export type CatStatus = "Active" | "Inactive";
export type CatVisibility = "Visible" | "Hidden";
export type DefaultPriority = "Low" | "Medium" | "High" | "None";

export interface RequestType {
  id: string;
  name: string;
  helperText: string;
  order: number;
  status: CatStatus;
  visibility: CatVisibility;
  defaultPriority: DefaultPriority;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  /** Short employee-facing description. */
  description: string;
  /** Lucide icon key (see categoryIcons). */
  icon: string;
  /** Routing — references the centralized org config. */
  departmentId: string;
  teamId: string;
  requestTypes: RequestType[];
  order: number;
  status: CatStatus;
  visibility: CatVisibility;
  /** Marks Admin/General Query options as prototype (support-only label). */
  prototypeNote?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryConfig {
  version: number;
  categories: Category[];
}
