import { getProductById } from './lib/products';
import type { Metadata } from 'next';

interface MetadataProps {
  params: { id: string };
}

export async function generateMetadata(
  { params }: MetadataProps
): Promise<Metadata> {
  const product = await getProductById(params.id);

  if (!product) {
    return {
      title: 'Product not found',
      description: 'No product information available',
    };
  }

  return {
    title: product.name,
    description: product.description,
  };
}