import { EmergencyContact } from './EmergencyContact';
import { DoctorInfo } from './DoctorInfo';

export interface Contact {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  occupation?: string;
  emergencyContacts: EmergencyContact[];
  doctorInfo: DoctorInfo;
}
