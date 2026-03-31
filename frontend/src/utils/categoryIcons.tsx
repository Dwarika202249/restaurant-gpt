import React from 'react';
import * as LucideIcons from 'lucide-react';
import { 
  Utensils, 
  Pizza, 
  Coffee, 
  Beer, 
  Wine, 
  GlassWater, 
  Beef, 
  Fish, 
  Soup, 
  Cake, 
  IceCream, 
  Cookie, 
  Flame, 
  Leaf, 
  Apple, 
  Egg, 
  Martini, 
  Popcorn, 
  Sandwich,
  Grape,
  Star,
  Zap,
  Timer,
  ChefHat,
  Microwave,
  Baby,
  Skull,
  Drumstick,
  Croissant,
  Candy,
  Cherry,
  Citrus,
  CandyCane,
  Carrot,
  CookingPot,
  Milk,
  WineOff,
  CigaretteOff
} from 'lucide-react';

// Curated list of restaurant-relevant icons with descriptive labels for searching
export const CATEGORY_ICONS_LIST = [
  { name: 'Utensils', component: Utensils, tags: ['food', 'dining', 'cutlery'] },
  { name: 'ChefHat', component: ChefHat, tags: ['chef', 'kitchen', 'signature'] },
  { name: 'Pizza', component: Pizza, tags: ['pizza', 'italian', 'slice'] },
  { name: 'Sandwich', component: Sandwich, tags: ['bread', 'lunch', 'sub'] },
  { name: 'Drumstick', component: Drumstick, tags: ['chicken', 'meat', 'poultry'] },
  { name: 'Beef', component: Beef, tags: ['steak', 'meat', 'beef'] },
  { name: 'Fish', component: Fish, tags: ['seafood', 'fish', 'ocean'] },
  { name: 'Soup', component: Soup, tags: ['bowl', 'hot', 'soup'] },
  { name: 'Salad', component: LucideIcons.Sprout, tags: ['vegan', 'healthy', 'leaf'] },
  { name: 'Coffee', component: Coffee, tags: ['hot', 'caffeine', 'latte'] },
  { name: 'Beer', component: Beer, tags: ['alcohol', 'draft', 'pint'] },
  { name: 'Wine', component: Wine, tags: ['alcohol', 'red', 'white'] },
  { name: 'GlassWater', component: GlassWater, tags: ['drink', 'water', 'cold'] },
  { name: 'Martini', component: Martini, tags: ['cocktail', 'alcohol', 'bar'] },
  { name: 'Cake', component: Cake, tags: ['dessert', 'sweet', 'birthday'] },
  { name: 'IceCream', component: IceCream, tags: ['dessert', 'cold', 'sweet'] },
  { name: 'Cookie', component: Cookie, tags: ['dessert', 'snack', 'sweet'] },
  { name: 'Croissant', component: Croissant, tags: ['bakery', 'bread', 'breakfast'] },
  { name: 'Candy', component: Candy, tags: ['sweet', 'sugar', 'snack'] },
  { name: 'Cherry', component: Cherry, tags: ['fruit', 'sweet', 'berry'] },
  { name: 'Citrus', component: Citrus, tags: ['fruit', 'lemon', 'orange'] },
  { name: 'Apple', component: Apple, tags: ['fruit', 'healthy', 'orchard'] },
  { name: 'Grape', component: Grape, tags: ['fruit', 'wine', 'bunch'] },
  { name: 'Carrot', component: Carrot, tags: ['vegetable', 'healthy', 'rabbit'] },
  { name: 'Egg', component: Egg, tags: ['breakfast', 'morning', 'protein'] },
  { name: 'Milk', component: Milk, tags: ['drink', 'dairy', 'glass'] },
  { name: 'Popcorn', component: Popcorn, tags: ['snack', 'movie', 'salt'] },
  { name: 'CandyCane', component: CandyCane, tags: ['sweet', 'holiday', 'mint'] },
  { name: 'CookingPot', component: CookingPot, tags: ['kitchen', 'cooking', 'stew'] },
  { name: 'Microwave', component: Microwave, tags: ['quick', 'heat', 'fast'] },
  { name: 'Flame', component: Flame, tags: ['spicy', 'hot', 'grill'] },
  { name: 'Leaf', component: Leaf, tags: ['vegan', 'vegetarian', 'plant'] },
  { name: 'Star', component: Star, tags: ['featured', 'popular', 'best'] },
  { name: 'Zap', component: Zap, tags: ['special', 'quick', 'flash'] },
  { name: 'Timer', component: Timer, tags: ['ready', 'wait', 'clock'] },
  { name: 'Baby', component: Baby, tags: ['kids', 'child', 'menu'] },
  { name: 'Skull', component: Skull, tags: ['danger', 'extra spicy', 'extreme'] },
  { name: 'WineOff', component: WineOff, tags: ['non-alcoholic', 'bar', 'safe'] },
  { name: 'CigaretteOff', component: CigaretteOff, tags: ['no smoking', 'area', 'rules'] }
];

// Helper to get component by name
export const getCategoryIconComponent = (name: string) => {
  const icon = CATEGORY_ICONS_LIST.find(i => i.name === name);
  return icon ? icon.component : null;
};

interface DynamicIconProps {
  name: string | undefined;
  className?: string;
  size?: number | string;
  fallback?: string;
}

export const CategoryIcon: React.FC<DynamicIconProps> = ({ 
  name, 
  className = '', 
  size = 24, 
  fallback = '🍴' 
}) => {
  if (!name) return <span className={className}>{fallback}</span>;
  
  const IconComponent = getCategoryIconComponent(name);
  
  if (IconComponent) {
    // Casting size to any as Lucide types can be picky with non-numeric strings
    const iconSize = typeof size === 'string' ? parseInt(size) || size : size;
    return <IconComponent className={className} size={iconSize as any} />;
  }
  
  // Fallback to emoji if string is not a known icon name
  const fontSize = typeof size === 'number' ? `${size}px` : size;
  return <span className={className} style={{ fontSize }}>{name}</span>;
};
