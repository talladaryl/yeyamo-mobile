export type CatalogCountry = 'CM' | 'SN' | 'CI' | 'NG';

export interface ProverbDemo {
  id: string;
  countryCode: CatalogCountry;
  category: string;
  language: string;
  text: string;
  translation: string;
  meaning: string;
  usage: string;
  region: string;
  imageUrl: string;
}

export interface RecipeDemo {
  id: string;
  countryCode: CatalogCountry;
  category: string;
  name: string;
  region: string;
  description: string;
  ingredients: string[];
  steps: string[];
  preparationMinutes: number;
  difficulty: 'Facile' | 'Intermédiaire' | 'Avancé';
  imageUrl: string;
}

export interface ArtCategoryDemo {
  id: string;
  name: string;
  description: string;
  icon: string;
  imageUrl: string;
}

const proverbSeeds = [
  ['La patience cuit la pierre.', 'Patience', 'bas', 'Centre'],
  ['Une seule main ne peut attacher un paquet.', 'Communauté', 'dua', 'Littoral'],
  ['La pluie ne tombe pas sur un seul toit.', 'Solidarité', 'ewo', 'Centre'],
  ['Celui qui écoute les anciens ne perd pas son chemin.', 'Sagesse', 'bax', 'Ouest'],
  ['Le ruisseau devient rivière en avançant.', 'Persévérance', 'yba', 'Ouest'],
  ['Le tambour parle à celui qui connaît son rythme.', 'Transmission', 'mgo', 'Nord-Ouest'],
  ['On reconnaît l’arbre à ses fruits.', 'Éducation', 'fr', 'Sud'],
  ['Le voyageur apprend avec ses pieds.', 'Voyage', 'ff', 'Nord'],
  ['Quand les araignées unissent leurs toiles, elles attachent un lion.', 'Communauté', 'fr', 'Adamaoua'],
  ['Le soleil n’oublie aucun village.', 'Espoir', 'bul', 'Sud'],
  ['La parole donnée est une dette.', 'Respect', 'dua', 'Littoral'],
  ['Le feu partagé réchauffe tout le village.', 'Solidarité', 'bas', 'Centre'],
  ['Qui plante un arbre pense à demain.', 'Nature', 'ewo', 'Centre'],
  ['Le silence prépare la bonne réponse.', 'Sagesse', 'bax', 'Ouest'],
  ['L’enfant qui pose des questions ne se perd pas.', 'Éducation', 'ken', 'Sud-Ouest'],
  ['La calebasse flotte parce qu’elle accepte l’eau.', 'Adaptation', 'dua', 'Littoral'],
  ['Chaque sentier connaît les pas de son village.', 'Identité', 'mgo', 'Nord-Ouest'],
  ['Un repas partagé a toujours meilleur goût.', 'Hospitalité', 'fr', 'Est'],
  ['La bonne parole ouvre une porte fermée.', 'Respect', 'ff', 'Extrême-Nord'],
  ['Le savoir est une lampe que le vent n’éteint pas.', 'Transmission', 'bax', 'Ouest'],
  ['Avant de courir, regarde le chemin.', 'Prudence', 'bas', 'Centre'],
  ['La forêt garde la mémoire des anciens.', 'Nature', 'bul', 'Sud'],
  ['Une corde tressée résiste mieux.', 'Communauté', 'yba', 'Ouest'],
  ['Le courage commence par un premier pas.', 'Courage', 'fr', 'Adamaoua'],
  ['Celui qui remercie reçoit deux fois.', 'Gratitude', 'ewo', 'Centre'],
] as const;

const proverbImages = [
  'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=900',
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=900',
  'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=900',
  'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=900',
];

export const demoProverbs: ProverbDemo[] = Array.from({ length: 100 }, (_, index) => {
  const seed = proverbSeeds[index % proverbSeeds.length];
  const collection = Math.floor(index / proverbSeeds.length) + 1;
  return {
    id: `proverb-${index + 1}`,
    countryCode: 'CM',
    text: seed[0],
    category: seed[1],
    language: seed[2],
    region: seed[3],
    translation: seed[0],
    meaning: `Cette parole rappelle l’importance de ${seed[1].toLowerCase()} dans la vie quotidienne et la transmission entre générations.`,
    usage: `Collection ${collection} · À employer lors des échanges familiaux, de l’apprentissage ou des conseils communautaires.`,
    imageUrl: proverbImages[index % proverbImages.length],
  };
});

const recipeSeeds = [
  ['Ndolé aux crevettes', 'Plats', 'Littoral', ['Feuilles de ndolé', 'Arachides', 'Crevettes', 'Plantain']],
  ['Poulet DG', 'Plats', 'Ouest', ['Poulet', 'Plantain mûr', 'Carottes', 'Poivrons']],
  ['Eru et water fufu', 'Plats', 'Sud-Ouest', ['Eru', 'Waterleaf', 'Peau de bœuf', 'Fufu']],
  ['Koki de haricots', 'Plats', 'Ouest', ['Haricots blancs', 'Huile de palme', 'Feuilles de bananier']],
  ['Mbongo tchobi', 'Plats', 'Littoral', ['Poisson', 'Épices mbongo', 'Tomate', 'Manioc']],
  ['Okok sucré', 'Plats', 'Centre', ['Feuilles d’okok', 'Arachides', 'Sucre', 'Manioc']],
  ['Taro sauce jaune', 'Plats', 'Ouest', ['Taro', 'Huile de palme', 'Épices', 'Viande']],
  ['Corn-chaff', 'Plats', 'Nord-Ouest', ['Maïs', 'Haricots', 'Huile de palme', 'Épices']],
  ['Sanga', 'Plats', 'Centre', ['Maïs frais', 'Feuilles de manioc', 'Jus de noix de palme']],
  ['Poisson braisé', 'Grillades', 'Littoral', ['Poisson frais', 'Pèbè', 'Djansang', 'Piment']],
  ['Soja braisé', 'Grillades', 'Adamaoua', ['Bœuf', 'Oignon', 'Poivre', 'Piment']],
  ['Kilichi', 'Grillades', 'Extrême-Nord', ['Bœuf séché', 'Arachide', 'Épices', 'Piment']],
  ['Beignets haricots bouillie', 'Petit-déjeuner', 'National', ['Farine', 'Haricots', 'Maïs', 'Sucre']],
  ['Puff-puff', 'Collations', 'Sud-Ouest', ['Farine', 'Levure', 'Sucre', 'Huile']],
  ['Miondo', 'Accompagnements', 'Littoral', ['Manioc fermenté', 'Feuilles']],
  ['Bobolo', 'Accompagnements', 'Centre', ['Manioc fermenté', 'Feuilles']],
  ['Plantain tapé', 'Accompagnements', 'Littoral', ['Plantain mûr', 'Huile', 'Sel']],
  ['Foléré', 'Boissons', 'Nord', ['Fleurs d’hibiscus', 'Ananas', 'Gingembre', 'Sucre']],
  ['Jus de gingembre', 'Boissons', 'National', ['Gingembre', 'Citron', 'Sucre', 'Eau']],
  ['Matango', 'Boissons', 'Littoral', ['Sève de palmier']],
  ['Malaxé de pistache', 'Plats', 'Centre', ['Pistache africaine', 'Viande', 'Feuilles', 'Épices']],
  ['Nnam owondo', 'Plats', 'Centre', ['Arachides', 'Poisson fumé', 'Feuilles de bananier']],
  ['Achu', 'Plats', 'Nord-Ouest', ['Taro', 'Huile de palme', 'Épices', 'Viande']],
  ['Mintoumba', 'Collations', 'Sud', ['Manioc', 'Huile de palme', 'Sel']],
  ['Banane malaxée', 'Plats', 'Ouest', ['Banane verte', 'Arachides', 'Poisson fumé']],
] as const;

const recipeImages = [
  'https://images.unsplash.com/photo-1547592180-85f173990554?w=900',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900',
  'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=900',
  'https://images.unsplash.com/photo-1543353071-873f17a7a088?w=900',
  'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=900',
];

export const demoRecipes: RecipeDemo[] = Array.from({ length: 100 }, (_, index) => {
  const seed = recipeSeeds[index % recipeSeeds.length];
  const variation = Math.floor(index / recipeSeeds.length) + 1;
  return {
    id: `recipe-${index + 1}`,
    countryCode: 'CM',
    name: variation === 1 ? seed[0] : `${seed[0]} · variante ${variation}`,
    category: seed[1],
    region: seed[2],
    description: `Une préparation camerounaise de ${seed[2]}, documentée dans la collection culinaire YeYamo.`,
    ingredients: [...seed[3]],
    steps: ['Préparer et laver soigneusement les ingrédients.', 'Cuire la base à feu moyen en respectant les textures.', 'Ajouter les épices progressivement puis laisser mijoter.', 'Rectifier l’assaisonnement et servir avec l’accompagnement indiqué.'],
    preparationMinutes: 30 + (index % 7) * 10,
    difficulty: index % 5 === 0 ? 'Avancé' : index % 2 === 0 ? 'Intermédiaire' : 'Facile',
    imageUrl: recipeImages[index % recipeImages.length],
  };
});

export const demoArtCategories: ArtCategoryDemo[] = [
  ['sculpture', 'Sculpture', 'Bois, bronze, pierre et figures de transmission.', 'hammer-outline', 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=900'],
  ['painting', 'Peinture', 'Toiles contemporaines, pigments et récits visuels.', 'brush-outline', 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=900'],
  ['weaving', 'Tissage', 'Toghu, étoffes, fibres et motifs des Grassfields.', 'grid-outline', 'https://images.unsplash.com/photo-1606722590583-6951b5ea92ad?w=900'],
  ['pottery', 'Poterie', 'Terre cuite, céramique et objets rituels ou usuels.', 'water-outline', 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=900'],
  ['beadwork', 'Perlage', 'Parures, trônes, masques et symboles en perles.', 'diamond-outline', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=900'],
  ['basketry', 'Vannerie', 'Paniers, fibres végétales et objets domestiques.', 'basket-outline', 'https://images.unsplash.com/photo-1590739225287-bd31519780c3?w=900'],
  ['photography', 'Photographie', 'Regards documentaires et créations contemporaines.', 'camera-outline', 'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?w=900'],
  ['music', 'Instruments et musique', 'Tambours, balafons, sanza et fabrication sonore.', 'musical-notes-outline', 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=900'],
].map(([id, name, description, icon, imageUrl]) => ({ id, name, description, icon, imageUrl }));

export const proverbCategories = ['Tous', ...new Set(demoProverbs.map((item) => item.category))];
export const recipeCategories = ['Tous', ...new Set(demoRecipes.map((item) => item.category))];
