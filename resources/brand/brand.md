# Kick Off — Brand (brand.md)

> Fuente: Brandbook oficial (KICK OFF). Este archivo es la versión “dev-friendly” para productos digitales.

## 1) Esencia rápida
- Marca: Kick Off
- Personalidad: clara, moderna, enérgica, profesional
- Regla de oro: consistencia > creatividad (no deformar ni recolorear el logo)

## 2) Logo (Isologo)
### Versiones permitidas
- Isologo principal (vertical / cuadrado)
- Isologo horizontal (solo si el formato lo exige)

### Área autónoma (clear space)
- Mantén un margen mínimo “X” alrededor del isologo (según el módulo definido en el brandbook).
- No pongas texto/íconos/fotos dentro de esa zona.

### Tamaño mínimo
- Digital: mínimo 128px de ancho
- Impresos: mínimo 20mm de ancho (sin bajada/slogan en tamaños muy chicos)

### Usos incorrectos (NO)
- No cambiar colores
- No cambiar tipografía
- No cambiar proporciones
- No reordenar elementos
- No expandir/condensar

## 3) Colores (corporativos)
> Usar estos colores es obligatorio en representaciones corporativas.

### Palette
- Navy (Pantone 282 C)
  - RGB: 9, 31, 64
  - HEX: #091F40
  - CMYK: 100, 87, 42, 52

- Orange (Pantone 1495 C)
  - RGB: 247, 142, 32
  - HEX: #F78E20
  - CMYK: 0, 53, 99, 0

- Teal (Pantone 338 C)
  - RGB: 115, 200, 175
  - HEX: #73C8AF
  - CMYK: 54, 0, 39, 0

- Gold/Brown (Pantone 7571 C)
  - RGB: 202, 126, 45
  - HEX: #CA7E2D
  - CMYK: 18, 56, 97, 3

- Gray 20% black
  - RGB: 209, 211, 212
  - HEX: #D1D3D4
  - CMYK: 0, 0, 0, 20

### Reglas rápidas de uso en UI (recomendación)
- Fondo/base: Navy
- Acentos/CTA: Orange
- Estados positivos / highlights suaves: Teal
- Bordes/divisores: Gray
- Evita usar Gold/Brown como CTA principal (mejor como acento secundario)

## 4) Tipografía
### Primarias (corporativas)
- Multicolore Pro
- Gotham (Book, Condensed, Bold Condensed según corresponda)

### Fallback
- Arial (solo si no se puede usar la tipografía corporativa)

### Reglas rápidas (recomendación UI)
- Títulos: Gotham (Bold / Bold Condensed)
- Cuerpo: Gotham Book
- Énfasis puntual: Multicolore Pro (muy limitado: logos, headings especiales)

## 5) Iconografía e imágenes (recomendación)
- Iconos simples, geométricos, consistentes (2px stroke o filled, pero no mezclar)
- Fotos: ambientes de trabajo, colaboración, emprendimiento; tonos limpios y bien iluminados
- Evitar estilos “tech oscuros” con neones (choca con la identidad corporativa)

## 6) Tokens (puente a código)
> Estos tokens se reflejan en `resources/brand/tokens.json`.

### Color tokens (suggested)
- color.background.primary = #091F40
- color.accent.primary = #F78E20
- color.accent.secondary = #73C8AF
- color.border.default = #D1D3D4
- color.text.onDark = #FFFFFF
- color.text.onLight = #091F40

### Spacing & Radius (suggested baseline)
- spacing.1 = 4
- spacing.2 = 8
- spacing.3 = 12
- spacing.4 = 16
- radius.sm = 8
- radius.md = 12
- radius.lg = 16

## 7) Assets (repo)
- Logos: `resources/brand/assets/logos/`
- Ejemplos: `resources/brand/examples/`
- Este documento: `resources/brand/brand.md`
- Tokens: `resources/brand/tokens.json`