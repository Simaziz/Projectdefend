// app/types.ts
export type Coffee = {
  _id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  discount?: number;
  isTopDrink?: boolean;
};

export type UserRole = 'user' | 'admin' | 'staff';