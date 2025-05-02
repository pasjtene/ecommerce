
  export interface User {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    roles: Role[];
  }


  export interface User2 {
    ID: number;
    UserName: string;
    FirstName: string;
    LastName: string;
    Email: string;
    Roles: Role[];
  }

  export interface Role {
	ID: number;
	CreatedAt: string; // Add these if you want to use them
	UpdatedAt: string;
	DeletedAt: null | string;
	Name: string;
	Description?: string;
  }