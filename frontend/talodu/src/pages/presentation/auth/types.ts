
  export interface User {
    id: number;
    ID: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    roles: Role[];
  }

   export interface ShopUser {
      id: number;
      ID: number;
      username: string;
      FirstName: string;
      LastName: string;
      Email: string;
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
    images: ProductImage[]
  }

  export interface Shop {
    ID: number;
    name: string;
    Slug: string;
    description?: string;
    moto?: string;
    OwnerID: number;
    owner: ShopUser;
    Employees: User[];
    products: Product[];
    City: string
  }

  export interface ProductImage {
    ID: string;
    url: string;
    altText?: string;
    isPrimary?: boolean;
    description?: string;
    name?: string;
    price?: number;
    sku?: string;
  }

  export interface ProductCategory {
    ID: number;
    name: string;
    description?: string;
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