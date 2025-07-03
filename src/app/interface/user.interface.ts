export interface IUser {
  _id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  is_active?: string;
}

export interface IUsersList extends IUser {}
export interface IUserRequest extends IUser {}
