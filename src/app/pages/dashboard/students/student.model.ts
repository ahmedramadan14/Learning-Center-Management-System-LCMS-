export interface StudentUser {
  _id: string;
  name: string;
  phone: string;
  role: string;
  isActive: boolean;
}

export interface StudentGroup {
  _id: string;
  gradeLevelId?: string;
  name?: string;
}

export interface TeacherInfo {
  _id: string;
  userId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  _id: string;
  userId: StudentUser;
  studentCode: string;
  parentPhone: string;
  gender: string;
  grade: string;
  teacher?: TeacherInfo | null;
  groups: StudentGroup[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentsResponse {
  success: boolean;
  count: number;
  data: Student[];
}