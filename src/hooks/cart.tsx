import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const productsStoraged = await AsyncStorage.getItem('cartProducts');
      if (productsStoraged) {
        const productsStoragedObject = JSON.parse(productsStoraged);
        const productsStoragedArray: Product[] = Object.values(
          productsStoragedObject,
        );
        setProducts(productsStoragedArray);
      }
    }

    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const productsModifieded = products.map(productCart => {
        if (productCart.id === id) {
          const newQuantity = productCart.quantity + 1;
          return { ...productCart, quantity: newQuantity };
        }
        return productCart;
      });
      await AsyncStorage.setItem(
        'cartProducts',
        JSON.stringify(productsModifieded),
      );
      setProducts(productsModifieded);
    },
    [products],
  );

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART
      const productFound = products.find(stateProduct => {
        return stateProduct.id === product.id;
      });
      if (productFound) {
        increment(productFound.id);
      }
      const productWithQuantity = { ...product, quantity: 1 };
      const allProducts = [...products, productWithQuantity];
      await AsyncStorage.setItem('cartProducts', JSON.stringify(allProducts));
      setProducts(allProducts);
    },
    [increment, products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const productsModifieded = products.map(productCart => {
        if (productCart.id === id) {
          const newQuantity = productCart.quantity - 1;
          if (newQuantity >= 1) {
            return { ...productCart, quantity: newQuantity };
          }
        }
        return productCart;
      });
      await AsyncStorage.setItem(
        'cartProducts',
        JSON.stringify(productsModifieded),
      );
      setProducts(productsModifieded);
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
