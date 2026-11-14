//! Demo menu store: fictional dishes persisted in localStorage so creations,
//! edits and deletions survive reloads. `reset()` restores the seed. Shared
//! by the public carta (edit mode) and the admin page.

export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  tag?: string;
  photo: string;
}

export const CATEGORIES = ["Entradas", "Platos de fondo", "Postres", "Bebidas"] as const;

const u = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&q=60`;

export const SEED: Dish[] = [
  // ── Entradas ────────────────────────────────────────────────────────────
  { id: "d01", name: "Causa limeña", description: "Papa amarilla, ají amarillo y palta con camarones al ajillo.", price: 18, category: "Entradas", tag: "de la casa", photo: u("1559847844-5315695dadae") },
  { id: "d02", name: "Anticuchos de corazón", description: "Marinados 24 h en ají panca, con choclo y papa dorada.", price: 22, category: "Entradas", photo: u("1529042410759-befb1204b468") },
  { id: "d03", name: "Tequeños de lomo", description: "Crujientes, con guacamole y crema de rocoto.", price: 16, category: "Entradas", tag: "favorito", photo: u("1548340748-6d7afcd15f5c") },
  { id: "d04", name: "Ceviche clásico", description: "Pescado del día, leche de tigre, camote y chicha morada.", price: 26, category: "Entradas", tag: "estrella", photo: u("1535399831218-58861c9c354c") },
  // ── Platos de fondo ─────────────────────────────────────────────────────
  { id: "d05", name: "Lomo saltado", description: "Res al wok con cebolla, tomate y papas fritas al instante.", price: 38, category: "Platos de fondo", tag: "estrella", photo: u("1600891964092-4316c2880325") },
  { id: "d06", name: "Arroz con mariscos", description: "Mariscos frescos del día, culantro y limón de Chulucanas.", price: 42, category: "Platos de fondo", photo: u("1559735335-cb6c8ceba976") },
  { id: "d07", name: "Ají de gallina", description: "Crema de ají amarillo y pecanas sobre papa y arroz graneado.", price: 30, category: "Platos de fondo", photo: u("1604333163563-10c7b56d8e03") },
  { id: "d08", name: "Seco de res", description: "Cilantro molido en mortero, frejoles y yuca dorada.", price: 34, category: "Platos de fondo", photo: u("1603133872878-684f7fb17c66") },
  { id: "d09", name: "Chaufa de mariscos", description: "Wok de mariscos con sillao, cebolla china y tortilla crispy.", price: 36, category: "Platos de fondo", photo: u("1512058564366-18510be2db19") },
  // ── Postres ─────────────────────────────────────────────────────────────
  { id: "d10", name: "Suspiro limeño", description: "Manjar blanco, merengue al punto y portada de licor.", price: 14, category: "Postres", tag: "de la casa", photo: u("1488477181946-6428a0291777") },
  { id: "d11", name: "Tres leches", description: "Esponjoso, con canela y reducción de chicha morada.", price: 15, category: "Postres", photo: u("1563805042-7684c019e1cb") },
  { id: "d12", name: "Picarones", description: "Buñuelos de zapallo y camote con miel de chancaca.", price: 12, category: "Postres", tag: "favorito", photo: u("1488900128323-21503983a07e") },
  // ── Bebidas ─────────────────────────────────────────────────────────────
  { id: "d13", name: "Chicha morada artesanal", description: "Macerada con piña, canela y limón. Jarra 1 L.", price: 12, category: "Bebidas", photo: u("1544145945-f90425340c7e") },
  { id: "d14", name: "Limonada de hierbaluisa", description: "Fresca, con hielo pilé y un toque de jengibre.", price: 10, category: "Bebidas", photo: u("1523677011781-c91d1bbe2f9e") },
  { id: "d15", name: "Pisco sour", description: "Quebranta, maracuyá o clásico. Coctelería de autor.", price: 20, category: "Bebidas", tag: "premium", photo: u("1536935338788-846bb9981813") },
  { id: "d16", name: "Café de altura", description: "Grano de Villa Rica, espresso o filtrado.", price: 8, category: "Bebidas", photo: u("1509042239860-f550ce710b93") },
];

const KEY = "mg_demo_carta";

export function listDishes(): Dish[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [...SEED];
    const parsed = JSON.parse(raw) as Dish[];
    return Array.isArray(parsed) ? parsed : [...SEED];
  } catch {
    return [...SEED];
  }
}

function save(dishes: Dish[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(dishes));
  } catch {
    // Storage full or blocked: keep working in memory for this session.
  }
}

export function addDish(dish: Omit<Dish, "id">): Dish {
  const full: Dish = { ...dish, id: `d-${Date.now()}-${Math.floor(Math.random() * 1e4)}` };
  save([...listDishes(), full]);
  return full;
}

export function updateDish(id: string, changes: Omit<Dish, "id">): void {
  save(listDishes().map((dish) => (dish.id === id ? { ...changes, id } : dish)));
}

export function removeDish(id: string): void {
  save(listDishes().filter((dish) => dish.id !== id));
}

export function resetDishes(): void {
  save([...SEED]);
}
