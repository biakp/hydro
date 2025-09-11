import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import type {GetLatestArticlesQuery} from 'storefrontapi.generated';

type ArticleNode = NonNullable<
  NonNullable<
    GetLatestArticlesQuery['blog']
  >['articles']['edges'][number]['node']
>;

export function ArticleItem({
  article,
  loading,
}: {
  article: ArticleNode;
  loading?: 'eager' | 'lazy';
}) {
  const image = article.image;
  return (
    <Link
      className="group block rounded-lg overflow-hidden shadow-sm hover:shadow-md transition duration-300"
      key={article.id}
      prefetch="intent"
      to={`/blogs/novidades/${article.handle}`}
    >
      {image && (
        <div className="aspect-square overflow-hidden">
          <Image
            alt={image.altText || article.title}
            aspectRatio="1/1"
            data={image}
            loading={loading}
            sizes="(min-width: 45em) 400px, 100vw"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
        </div>
      )}
      <div className="p-4">
        <h4 className="font-medium text-gray-900 mb-1">{article.title}</h4>
        <small className="text-accent-dark font-medium">
          {new Date(article.publishedAt).toLocaleDateString('en-US')}
        </small>
      </div>
    </Link>
  );
}
