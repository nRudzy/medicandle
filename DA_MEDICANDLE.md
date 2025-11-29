# Direction Artistique - Medicandle

> **Référence pour toute l'équipe**  
> Ce document définit l'identité visuelle et les guidelines de la marque Medicandle.  
> Consultez-le avant toute création de contenu, page ou composant.

---

## 🎨 1. Identité de la marque

### Nom
**Medicandle**

### Univers
Bougies artisanales haut de gamme, ambiance florale, naturelle, minimaliste, épurée.

### Positionnement
- **Douceur** : chaleur apaisante, bien-être
- **Chaleur** : ambiance cosy, intime
- **Artisanat** : fait main, attention aux détails
- **Premium discret** : qualité sans ostentation, élégance sobre

### Valeurs
- Authenticité
- Naturalité
- Élégance sobre
- Artisanat de qualité

---

## 🎨 2. Palette de couleurs

### Couleurs principales

#### Vert sauge pastel (couleur signature)
- **HEX** : `#C7DCC5`
- **Usage** : identité de marque, éléments forts, CTA principaux, accents premium
- **Contexte** : couleur signature, à utiliser avec parcimonie pour garder son impact

#### Brun terre luxueux
- **HEX** : `#7A5C4A`
- **Usage** : textes importants, éléments de navigation, boutons secondaires, bordures élégantes
- **Contexte** : apporte profondeur et chaleur, contraste avec les tons clairs

### Couleurs de fond

#### Beige clair / fond chic
- **HEX** : `#EEE9E4`
- **Usage** : fonds de pages, sections, cartes, zones de contenu
- **Contexte** : base chaleureuse et douce, alternative au blanc pur

#### Blanc ivoire
- **HEX** : `#FAFAF7`
- **Usage** : fonds de cartes, zones de texte, espaces négatifs
- **Contexte** : plus doux que le blanc pur, s'harmonise avec la palette

### Couleur de texte

#### Noir brun profond (texte premium)
- **HEX** : `#2A1F1A`
- **Usage** : textes principaux, titres, contenu important
- **Contexte** : plus doux que le noir pur, s'harmonise avec la palette naturelle

### Couleurs d'accent (à utiliser avec parcimonie)

#### Rose floral pâle
- **HEX** : `#F1DEDA`
- **Usage** : accents très légers, hover states subtils, éléments décoratifs discrets
- **Contexte** : jamais envahissant, toujours en complément

#### Jaune miel doux
- **HEX** : `#E8C896`
- **Usage** : accents chaleureux, highlights discrets, éléments de mise en avant légers
- **Contexte** : rappelle la cire, utilisez avec modération

### Guide d'utilisation des couleurs

#### Règles générales
1. **Couleurs principales** (vert sauge + brun) : pour l'identité et les éléments forts
   - Logo, navigation principale
   - Boutons CTA importants
   - Titres et éléments de mise en avant

2. **Beige / blanc ivoire** : pour les fonds et grandes surfaces
   - Fond de pages
   - Cartes et conteneurs
   - Espaces de respiration

3. **Noir brun** : pour les textes importants
   - Titres H1, H2, H3
   - Textes de contenu principal
   - Informations critiques

4. **Rose / miel** : en petits accents, jamais envahissants
   - Hover states subtils
   - Éléments décoratifs discrets
   - Mise en avant légère

#### Contraste et accessibilité
- Toujours vérifier le contraste entre texte et fond (minimum WCAG AA)
- Le brun profond (`#2A1F1A`) sur beige clair (`#EEE9E4`) est lisible
- Le brun profond sur blanc ivoire est optimal
- Éviter le vert sauge pour les textes longs (utiliser pour accents uniquement)

---

## ✍️ 3. Typographies

### Police pour titres : Playfair Display (ou équivalent serif élégant)

**Usage** :
- Titres principaux (H1, H2, H3)
- Headlines de pages
- Noms de produits en mise en avant
- Citations et textes d'ambiance

**Caractéristiques** :
- Style serif élégant et floral
- Rendu premium et sophistiqué
- Parfait pour l'univers artisanal haut de gamme

**Exemple d'utilisation** :
```css
font-family: 'Playfair Display', serif;
font-weight: 400; /* Regular pour élégance */
font-weight: 600; /* Semi-bold pour titres importants */
```

### Police pour corps de texte : Inter (ou équivalent sans-serif moderne)

**Usage** :
- Paragraphes et contenu courant
- Labels et textes UI
- Descriptions de produits
- Navigation et menus
- Formulaires

**Caractéristiques** :
- Sans-serif moderne et lisible
- Excellente lisibilité à toutes tailles
- Style épuré et contemporain

**Exemple d'utilisation** :
```css
font-family: 'Inter', sans-serif;
font-weight: 400; /* Regular pour texte courant */
font-weight: 500; /* Medium pour labels */
font-weight: 600; /* Semi-bold pour textes importants */
```

### Hiérarchie typographique

#### Titres
- **H1** : Playfair Display, 48-64px, weight 600
- **H2** : Playfair Display, 36-48px, weight 600
- **H3** : Playfair Display, 24-32px, weight 400-600

#### Corps
- **Paragraphe** : Inter, 16-18px, weight 400, line-height 1.6-1.8
- **Labels** : Inter, 14-16px, weight 500
- **Petit texte** : Inter, 12-14px, weight 400

### Règles
- **Ne jamais mélanger** : Playfair pour titres, Inter pour le reste
- **Respecter la hiérarchie** : tailles cohérentes selon l'importance
- **Espacement** : généreux entre les éléments (air, respiration)

---

## 🖼️ 4. Logos & usages

### Logo principal : `medicandle_logo_no_bg.png`

**Emplacement** : `/public/branding/medicandle_logo_no_bg.png`

**Usage** :
- Header du site (navigation principale)
- Page d'accueil (hero section)
- Footer
- Pages marketing et publiques
- Cartes de visite, documents officiels

**Bonnes pratiques** :
- ✅ Utiliser sur fond blanc ou beige clair (`#EEE9E4`)
- ✅ Garder des marges de respiration (minimum 20% de la hauteur du logo)
- ✅ Respecter le ratio d'aspect original (ne pas déformer)
- ✅ Taille minimale recommandée : 120px de hauteur pour le web
- ✅ Taille maximale : selon le contexte, mais rester sobre

**À éviter** :
- ❌ Utiliser sur fonds colorés ou complexes
- ❌ Déformer ou étirer le logo
- ❌ Réduire en dessous de 80px de hauteur
- ❌ Ajouter des effets (ombres, contours) sans validation DA

### Logo icône : `medicandle_logo.jpg`

**Emplacement** : `/public/branding/medicandle_logo.jpg`

**Usage** :
- Favicon du site
- App icon (PWA, mobile)
- Petits emplacements carrés
- Onglets de navigateur
- Signets et raccourcis

**Bonnes pratiques** :
- ✅ Format carré optimisé
- ✅ Utilisable à très petite taille (16x16px minimum)
- ✅ Lisible même réduit

**Configuration technique** :
- Favicon configuré dans `app/layout.tsx` via les métadonnées
- Formats supportés : JPG, PNG, ICO
- Tailles recommandées : 16x16, 32x32, 48x48, 180x180 (Apple touch icon)

---

## 🎭 5. Style visuel global

### Ambiance générale
- **Naturelle** : inspirations végétales, matières organiques
- **Florale** : références discrètes aux fleurs et plantes
- **Épurée** : simplicité, clarté, pas de surcharge
- **Chaleureuse** : douceur, bien-être, cosy

### Principes de design

#### 1. Espace blanc (respiration)
- **Beaucoup d'espace blanc** : laisser respirer les éléments
- **Mise en avant des produits** : les bougies sont les stars
- **Hiérarchie claire** : un élément principal par section

#### 2. Photos produits
- **Lumière douce** : éclairage naturel, pas de flash agressif
- **Fond neutre** : beige clair, blanc ivoire, ou textures douces
- **Mise en scène simple** : pas de surcharge, focus sur le produit
- **Ambiance cosy** : intérieur chaleureux, décors épurés

#### 3. Éléments graphiques
- **Motifs floraux très fins** : lignes délicates, jamais envahissants
- **Lignes douces** : courbes organiques, pas d'angles agressifs
- **Rien de trop chargé** : simplicité avant tout
- **Textures subtiles** : papier, tissu, matières naturelles en arrière-plan discret

### Mise en page
- **Grilles aérées** : espacement généreux entre les éléments
- **Alignement soigné** : précision et rigueur
- **Sections bien délimitées** : clarté de la structure
- **Responsive** : adaptation fluide à tous les écrans

---

## 🎯 6. Guidelines UI / UX

### Boutons

#### Boutons principaux (CTA)
- **Couleur** : vert sauge (`#C7DCC5`) ou brun terre (`#7A5C4A`)
- **Texte** : noir brun (`#2A1F1A`) ou blanc selon contraste
- **Style** : bords légèrement arrondis (border-radius: 8-12px)
- **Padding** : généreux pour le confort (py-3 px-6)
- **Hover** : légère assombrissement ou élévation subtile

#### Boutons secondaires
- **Style** : outline avec bordure brun terre
- **Fond** : transparent ou beige clair
- **Texte** : brun terre

#### États
- **Hover** : transition douce (200-300ms)
- **Active** : légère pression visuelle
- **Disabled** : opacité réduite, curseur non autorisé

### Formulaires

#### Champs de saisie
- **Bordure** : fine, couleur brun terre léger
- **Focus** : bordure vert sauge, outline subtil
- **Fond** : blanc ivoire ou beige clair
- **Texte** : noir brun
- **Placeholder** : gris doux, style italique léger

#### Labels
- **Police** : Inter, 14px, weight 500
- **Couleur** : noir brun
- **Espacement** : 8px au-dessus du champ

### Cartes et conteneurs

#### Style général
- **Fond** : blanc ivoire ou beige clair
- **Bordure** : fine, couleur beige-gris doux (optionnel)
- **Ombre** : très légère, douce (shadow-sm)
- **Bords arrondis** : 12-16px pour les cartes principales
- **Padding** : généreux (p-6 minimum)

### Navigation

#### Menu principal
- **Fond** : transparent ou beige clair selon contexte
- **Liens** : noir brun, Inter medium
- **Hover** : soulignement discret ou couleur vert sauge
- **Active** : vert sauge ou brun terre selon hiérarchie

#### Sidebar (Back Office)
- **Fond** : sombre (stone-900) pour contraste avec contenu
- **Logo** : visible en haut
- **Liens** : clairs, Inter regular
- **Active** : fond légèrement plus clair, texte blanc

### Icônes

#### Style
- **Bibliothèque** : Lucide React (déjà intégrée)
- **Taille** : cohérente selon contexte (16px, 20px, 24px)
- **Couleur** : s'adapte au contexte (noir brun, brun terre, ou couleur d'accent)
- **Stroke width** : 1.5-2px pour élégance

### Animations et transitions

#### Principes
- **Douceur** : transitions fluides (200-300ms)
- **Naturelles** : courbes d'easing douces (ease-in-out)
- **Discrètes** : pas d'animations flashy ou distrayantes
- **Utiles** : animations qui améliorent la compréhension

#### Exemples
- Hover sur boutons : légère élévation ou assombrissement
- Apparition de contenu : fade-in doux
- Navigation : transitions fluides entre pages

---

## 🎨 7. Variables CSS et utilisation dans le code

### Variables CSS disponibles

Toutes les couleurs de la palette sont définies comme variables CSS dans `app/globals.css` et peuvent être utilisées de plusieurs façons :

#### Variables CSS natives
```css
var(--medicandle-sage)           /* Vert sauge pastel */
var(--medicandle-brown)          /* Brun terre luxueux */
var(--medicandle-beige)          /* Beige clair */
var(--medicandle-ivory)          /* Blanc ivoire */
var(--medicandle-dark-brown)     /* Noir brun profond */
var(--medicandle-rose)            /* Rose floral pâle */
var(--medicandle-honey)           /* Jaune miel doux */
```

#### Classes Tailwind personnalisées

**Backgrounds** :
- `bg-medicandle-sage`
- `bg-medicandle-brown`
- `bg-medicandle-beige`
- `bg-medicandle-ivory`
- `bg-medicandle-dark-brown`
- `bg-medicandle-rose`
- `bg-medicandle-honey`

**Textes** :
- `text-medicandle-sage`
- `text-medicandle-brown`
- `text-medicandle-beige`
- `text-medicandle-ivory`
- `text-medicandle-dark-brown`
- `text-medicandle-rose`
- `text-medicandle-honey`

**Bordures** :
- `border-medicandle-sage`
- `border-medicandle-brown`
- `border-medicandle-beige`
- `border-medicandle-ivory`
- `border-medicandle-dark-brown`
- `border-medicandle-rose`
- `border-medicandle-honey`

#### Utilisation dans les styles inline

```tsx
// Avec Tailwind (recommandé)
<div className="bg-medicandle-sage text-medicandle-dark-brown">

// Avec variables CSS directement
<div style={{ backgroundColor: 'var(--medicandle-sage)' }}>

// Avec Tailwind arbitraire
<div className="bg-[var(--medicandle-sage)]">
```

### Variables système (mappées sur la palette)

Les variables système de Shadcn UI sont automatiquement mappées sur la palette Medicandle :

- `--primary` → `--medicandle-sage` (vert sauge)
- `--secondary` → `--medicandle-beige` (beige clair)
- `--background` → `--medicandle-ivory` (blanc ivoire)
- `--foreground` → `--medicandle-dark-brown` (noir brun)
- `--muted` → `--medicandle-beige` (beige clair)
- `--accent` → `--medicandle-rose` (rose floral)
- `--border` → `--medicandle-beige` (beige clair)
- `--sidebar` → `--medicandle-brown` (brun terre)

Vous pouvez donc utiliser les classes Tailwind standards (`bg-primary`, `text-foreground`, etc.) qui utiliseront automatiquement les couleurs de la palette.

---

## 📐 8. Règles de cohérence

### Pour toute nouvelle page ou composant

1. **Couleurs** : utiliser uniquement la palette définie via les variables CSS ou classes Tailwind
2. **Typographies** : Playfair pour titres, Inter pour le reste
3. **Espacement** : généreux, respiration importante
4. **Logo** : utiliser le bon logo selon le contexte
5. **Style** : épuré, naturel, chaleureux

### Checklist avant publication

- [ ] Palette de couleurs respectée
- [ ] Typographies correctes (Playfair/Inter)
- [ ] Logo utilisé correctement (bon fichier, bon contexte)
- [ ] Espacement généreux et cohérent
- [ ] Contraste texte/fond vérifié (accessibilité)
- [ ] Style épuré et naturel
- [ ] Responsive testé
- [ ] Animations douces et discrètes

### Questions ou doutes ?

**Consultez ce document en premier.**  
Si une situation n'est pas couverte, privilégiez :
- Simplicité
- Cohérence avec l'existant
- Respect de l'identité naturelle et épurée

---

## 📝 Notes de version

- **Version 1.1** - Novembre 2025
  - Ajout des variables CSS universelles pour toutes les couleurs
  - Création de classes Tailwind personnalisées (`bg-medicandle-*`, `text-medicandle-*`, etc.)
  - Application de la palette au back-office (sidebar, header, pages)
  - Documentation de l'utilisation des variables CSS dans le code

- **Version 1.0** - Novembre 2025
  - Création du document de Direction Artistique
  - Définition de la palette de couleurs
  - Guidelines typographiques
  - Règles d'usage des logos
  - Principes UI/UX

---

**Ce document est vivant et peut évoluer.**  
Toute modification doit être validée et documentée.

