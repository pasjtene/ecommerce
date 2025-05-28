// Handle view details
  
import { demoPagesMenu } from '../../../menu';
import { useNavigate, useParams, useLocation} from 'react-router-dom';
import { User, Product, ProductImage, Shop} from '../auth/types';


const navigate = useNavigate();

export const handleViewDetailsLug = (shop: Shop) => {
    console.log("The shop is: ",shop);
   if(shop.Slug) {
    navigate(`../${demoPagesMenu.sales.subMenu.shopID.path}/${shop.Slug}`, { state: { shop } })
   } else {
    navigate(`../${demoPagesMenu.sales.subMenu.shopID.path}/${shop.ID}`, { state: { shop } })
   }
  };

 export const handleViewShopProducts = (shop: Shop) => {
      console.log("The shop is: ",shop);
     if(shop.Slug) {
      navigate(`../${demoPagesMenu.sales.subMenu.shopProducts.path}/${shop.Slug}`, { state: { shop } })
     } else {
      navigate(`../${demoPagesMenu.sales.subMenu.shopProducts.path}/${shop.ID}`, { state: { shop } })
     }
    };


export const handleViewProductDetailsLug = (product: Product) => {
    navigate(`../${demoPagesMenu.sales.subMenu.productID.path}/${product.Slug}`, { state: { product } })
  };


