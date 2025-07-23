import { UserRole } from './user-role.enum';

export interface UserDTO {
  id: number;
  name: string;
  lastName: string;
  firstName: string;
  jobTitle: string;
  email: string;
  phone: string;
  status: boolean;
  role: UserRole;
  company: string;
  profilePicture?: string;
}
