import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {
  ProductItemFragment,
  CollectionItemFragment,
  RecommendedProductFragment,
} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';

export function ProductItem({
  product,
  loading,
}: {
  product:
    | CollectionItemFragment
    | ProductItemFragment
    | RecommendedProductFragment;
  loading?: 'eager' | 'lazy';
}) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;
  return (
    <Link
      className="group block rounded-lg overflow-hidden shadow-sm hover:shadow-md transition duration-300"
      key={product.id}
      prefetch="intent"
      to={variantUrl}
    >
      {image && (
        <div className="aspect-square overflow-hidden">
          <Image
            alt={image.altText || product.title}
            aspectRatio="1/1"
            data={image}
            loading={loading}
            sizes="(min-width: 45em) 400px, 100vw"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
        </div>
      )}
      <div className="p-4">
        <h4 className="font-medium text-gray-900 mb-1">{product.title}</h4>
        <small className="text-accent-dark font-medium">
          <Money data={product.priceRange.minVariantPrice} />
        </small>
      </div>
    </Link>
  );
}
