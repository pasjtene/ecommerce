
  export interface User {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    roles: Role[];
  }

  export interface Product {
    ID: number;
    name: string;
    price: number;
    stock: number;
    description: string;
    //roles: Role[];
  }



  export interface ProductImage {
    ID: string;
    url: string;
    altText?: string;
    isPrimary?: boolean;
    // Add any additional product details you want to display
    description?: string;
    price?: number;
    sku?: string;
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