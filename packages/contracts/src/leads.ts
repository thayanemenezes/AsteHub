export const LEAD_STATUSES = ["NEW", "CONTACTED", "CLOSED"] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export interface LeadVehicleSummary {
  id: string;
  make: string;
  model: string;
  year: number;
}

export interface LeadLocationSummary {
  id: string;
  name: string;
}

export interface Lead {
  id: string;
  contactName: string;
  email: string | null;
  phone: string;
  message: string;
  status: LeadStatus;
  vehicleId: string | null;
  locationId: string | null;
  vehicle: LeadVehicleSummary | null;
  location: LeadLocationSummary | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeadPage {
  data: Lead[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CreateLeadInput {
  contactName: string;
  email?: string;
  phone: string;
  message: string;
  vehicleId?: string;
  locationId?: string;
}

export interface UpdateLeadInput {
  contactName?: string;
  email?: string | null;
  phone?: string;
  message?: string;
  status?: LeadStatus;
  vehicleId?: string | null;
  locationId?: string | null;
}
