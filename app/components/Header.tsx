import {Suspense, useEffect, useState} from 'react';
import {Await, NavLink, useAsyncValue} from 'react-router';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {Menu, Search, ShoppingCart, User} from 'lucide-react';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

type Viewport = 'desktop' | 'mobile';

export function Header({
  header,
  isLoggedIn,
  cart,
  publicStoreDomain,
}: HeaderProps) {
  const {shop, menu} = header;

  const [isScrolled, setIsScrolled] = useState(false);
  const [isScrollingUp, setIsScrollingUp] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const {type: asideType} = useAside();

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty(
      '--announcement-height',
      isScrolled ? '0px' : '40px',
    );
    root.style.setProperty('--header-height', isScrolled ? '64px' : '80px');

    const handleScroll = () => {
      if (asideType !== 'closed') return; // only run if aside is closed

      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 50);
      setIsScrollingUp(currentScrollY < lastScrollY);
      setLastScrollY(currentScrollY);

      window.addEventListener('scroll', handleScroll, {passive: true});
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    };
  }, [lastScrollY, isScrolled, asideType]);

  return (
    <div
      className={`fixed w-full z-40 transition-transform duration-500 ease-in-out
      ${isScrollingUp && isScrolled && asideType === 'closed' ? '-translate-y-full' : '-translate-y-0'}`}
    >
      {/* Announcement Bar */}
      <div
        className={`overflow-hidden transition-transform duration-500 ease-in-out bg-brand-navy text-white
          ${isScrolled ? 'max-h-0' : 'max-h-12'}`}
      >
        <div className="container mx-auto text-center py-2.5 px-4">
          <p className="font-source text-[13px] leading-tight sm:text-sm font-light tracking-wider">
            Free shipping on orders over $50!
          </p>
        </div>
      </div>
      {/* Header */}
      <header
        className={`transition-all duration-500 ease-in-out border-b ${isScrolled ? 'bg-white/80 backdrop-blur-lg shadow-sm border-transparent' : 'bg-white border-gray-100'}`}
      >
        <div className="container mx-auto lg:mx-20">
          <div className="flex justify-between items-center relative">
            {/* Mobile Logo (550px and below) */}
            <div
              className={`hidden max-[550px]:block text-center border-b ml-4 border-gray-100 transition-all duration-300 ease-in-out ${isScrolled ? 'py-1' : 'py-2'}`}
            >
              <NavLink
                to="/"
                prefetch="intent"
                className="font-playfair text-2xl tracking-normal inline-block"
              >
                <h1 className="font-medium uppercase my-0">{shop.name}</h1>
              </NavLink>
            </div>
            {/* Header content */}
            <div
              className={`flex items-center justify-between px-4 sm:px-6 transition-all duration-300 ease-in-out ${isScrolled ? 'py-3 sm:py-4' : ''}`}
            >
              {/* Mobile Menu Toggle */}
              <div className="lg:hidden">
                <HeaderMenuMobileToggle />
              </div>
            </div>
            {/* Desktop Logo (550px and above) */}
            <NavLink
              to="/"
              prefetch="intent"
              className={`font-playfair tracking-wider uppercase text-center max-[550px]:hidden absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 lg:text-left transition-all duration-300 ease-in-out ${isScrolled ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-[28px]'}`}
            >
              <h1 className="font-medium my-0">{shop.name}</h1>
            </NavLink>
            {/* Desktop Navigation */}
            <div className="hidden lg:block flex-1 px-2">
              <HeaderMenu
                menu={menu}
                viewport="desktop"
                primaryDomainUrl={header.shop.primaryDomain.url}
                publicStoreDomain="{publicStoreDomain}"
                isLoggedIn={isLoggedIn}
                cart={cart}
              />
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
  isLoggedIn,
  cart,
}: {
  menu: HeaderProps['header']['menu'];
  primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
  viewport: Viewport;
  publicStoreDomain: HeaderProps['publicStoreDomain'];
  isLoggedIn: HeaderProps['isLoggedIn'];
  cart: HeaderProps['cart'];
}) {
  const className = `header-menu-${viewport}`;
  const {close, open} = useAside();

  const baseClassName =
    'transition-all duration-200 hover:text-brand-gold font-source relative after:content-[""] after:absolute after:-bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-brand-gold after:transition-all after:duration-300 hover:after:w-full';
  const desktopClassName =
    'flex items-center justify-around text-sm uppercase tracking-wider';
  const mobileClassName = 'h-full flex flex-col px-6';

  return (
    <nav
      className={viewport === 'mobile' ? mobileClassName : desktopClassName}
      role="navigation"
    >
      {viewport === 'mobile' && (
        <>
          {/* Mobile Navigation Links */}
          <div className="space-y-6 py-4">
            {(menu ?? FALLBACK_HEADER_MENU).items.map((item) => {
              if (!item.url) return null;
              // if the url is internal, we strip the domain
              const url =
                item.url.includes('myshopify.com') ||
                item.url.includes(publicStoreDomain) ||
                item.url.includes(primaryDomainUrl)
                  ? new URL(item.url).pathname
                  : item.url;
              return (
                <NavLink
                  className={({isActive}) =>
                    `${baseClassName} text-lg py-2 block ${
                      isActive ? 'text-brand-gold' : 'text-brand-navy'
                    }`
                  }
                  end
                  key={item.id}
                  onClick={close}
                  prefetch="intent"
                  to={url}
                >
                  {item.title}
                </NavLink>
              );
            })}
          </div>
          {/* Mobile Footer Links */}
          <div className="mt-auto border-t border-gray-100 py-6">
            <div className="space-y-4">
              <NavLink
                to="/account"
                className="flex items-center space-x-2 text-brand-navy hover:text-brand-gold"
              >
                <User className="w-5 h-5" />
                <span className="font-source text-base">Account</span>
              </NavLink>
              <button
                onClick={() => {
                  close();
                  // Open search aside after closing the current one
                  setTimeout(() => {
                    open('search');
                  }, 100);
                }}
                className="flex items-center space-x-2 text-brand-navy hover:text-brand-gold w-full text-left"
              >
                <Search className="w-5 h-5" />
                <span className="font-source text-base">Search</span>
              </button>
            </div>
          </div>
        </>
      )}

      {viewport === 'desktop' && (
        <>
          <div className="hidden lg:flex lg:items-center lg:space-x-12">
            {(menu ?? FALLBACK_HEADER_MENU).items.map((item) => {
              if (!item.url) return null;

              // if the url is internal, we strip the domain
              const url =
                item.url.includes('myshopify.com') ||
                item.url.includes(publicStoreDomain) ||
                item.url.includes(primaryDomainUrl)
                  ? new URL(item.url).pathname
                  : item.url;
              return (
                <NavLink
                  className={({isActive}) =>
                    `${baseClassName} ${
                      isActive ? 'text-brand-gold' : 'text-brand-navy'
                    }`
                  }
                  end
                  key={item.id}
                  onClick={close}
                  prefetch="intent"
                  to={url}
                >
                  {item.title}
                </NavLink>
              );
            })}
          </div>
          <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
        </>
      )}
    </nav>
  );
}

function HeaderCtas({
  isLoggedIn,
  cart,
}: Pick<HeaderProps, 'isLoggedIn' | 'cart'>) {
  return (
    <nav className="flex items-center space-x-1" role="navigation">
      <SearchToggle />
      <NavLink
        prefetch="intent"
        to="/account"
        className="p-2 hover:text-brand-gold transition-all duration-200 relative flex items-center"
      >
        <User className="h-6 w-6 stroke-1" />
        <span className="sr-only">Account</span>
      </NavLink>
      <CartToggle cart={cart} />
    </nav>
  );
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <button
      className="p-2 -ml-2 hover:text-brand-gold transition-colors duration-200"
      onClick={() => open('mobile')}
    >
      <Menu className="h-6 w-6" />
    </button>
  );
}

function SearchToggle() {
  const {open} = useAside();
  return (
    <button
      className="p-2 hover:text-brand-gold transition-colors duration-200"
      onClick={() => open('search')}
    >
      <Search className="h-6 w-6 stroke-1" />
    </button>
  );
}

function CartBadge({count}: {count: number | null}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <a
      href="/cart"
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        } as CartViewPayload);
      }}
      className="p-2 hover:text-brand-gold transition-colors duration-200 relative flex items-center"
    >
      <ShoppingCart className="h-6 w-6 stroke-1" />
      {count !== null && count > 0 && (
        <span className="absolute top-1 -right-1 bg-brand-gold text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
          {count}
        </span>
      )}
    </a>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={null} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
};
