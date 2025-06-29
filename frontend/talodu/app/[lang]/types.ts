
export interface User {
    id: number;
    ID: number;
    username: string;
    first_name: string;
    last_name: string;
    Email: string;
    roles: Role[];
  }

  export interface AppError {
  message: string;
  details?: string;
  code?: string;
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
    translations: ProductTranslation[]
  }

  export interface ProductTranslation {
    ID: number;
    PoductID: number
    language: string
    name: string;
    description: string;
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

  export interface Translation {
  header: {
    search_placeholder: string;
    login: string;
    register: string;
    settings: string;
    list_shops: string;
    logout: string;
    cart: string;
  };
  common: {
    brand: string;
  };
  home: {
    title: string;
    subtitle: string;
    slogans: string[];
  };

  login: {
    title: string;
    email_placeholder: string;
    password_placeholder: string;
    submit_button: string;
    forgot_password: string;
    no_account: string;
    create_account: string;
    success_message: string;
    show_password: string;
  };
}

