
  export interface User {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    roles: Role[];
  }

   export interface ShopUser {
      id: number;
      username: string;
      FirstName: string;
      LastName: string;
      email: string;
      roles: Role[];
    }

  export interface Product {
    ID: number;
    name: string;
    price: number;
    stock: number;
    description: string;
    Slug: string;
    categories?: ProductCategory[];
    shop: Shop;
    ShopID: number
    shop_id: number
  }

  export interface ProductCategory {
    ID: number;
    name: string;
    description?: string;
  }

  export interface Shop {
    ID: number;
    Name: string;
    description?: string;
    moto?: string;
    OwnerID: number;
    owner: ShopUser;
    Employees: User[];
    Products: Product[];
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