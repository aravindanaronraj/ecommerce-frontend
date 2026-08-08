export interface GuestCartItem {
  _id: string;
  product: { _id: string; title: string; price: number; image: string; stock?: number };
  quantity: number;
}

const key = "guestCart";

export const getGuestCart = (): GuestCartItem[] => {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
};

export const saveGuestCart = (items: GuestCartItem[]) => localStorage.setItem(key, JSON.stringify(items));

export const addGuestItem = (product: GuestCartItem["product"], quantity: number) => {
  const items = getGuestCart();
  const existing = items.find((item) => item.product._id === product._id);
  if (existing) existing.quantity += quantity;
  else items.push({ _id: `guest-${product._id}`, product, quantity });
  saveGuestCart(items);
  return items;
};

export const clearGuestCart = () => localStorage.removeItem(key);
