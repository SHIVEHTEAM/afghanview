import { MenuItem, MenuTheme, MenuLayout } from "./types";

export class MenuSVGGenerator {
  static generateMenuSlide(
    item: MenuItem,
    theme: MenuTheme,
    layout: MenuLayout
  ): string {
    const svgContent = this.getLayoutSVG(item, theme, layout);
    return `data:image/svg+xml;base64,${this.utf8ToBase64(svgContent)}`;
  }

  // Generate multi-item slide
  static generateMultiItemSlide(
    items: MenuItem[],
    theme: MenuTheme,
    layout: MenuLayout
  ): string {
    const svgContent = this.getMultiItemLayoutSVG(items, theme, layout);
    return `data:image/svg+xml;base64,${this.utf8ToBase64(svgContent)}`;
  }

  private static utf8ToBase64(str: string): string {
    if (typeof window !== "undefined") {
      return btoa(unescape(encodeURIComponent(str)));
    } else {
      return Buffer.from(str, "utf8").toString("base64");
    }
  }

  private static getLayoutSVG(
    item: MenuItem,
    theme: MenuTheme,
    layout: MenuLayout
  ): string {
    switch (layout.id) {
      case "centered":
        return this.generateCenteredLayout(item, theme);
      case "left-aligned":
        return this.generateLeftAlignedLayout(item, theme);
      case "card":
        return this.generateCardLayout(item, theme);
      case "minimal":
        return this.generateMinimalLayout(item, theme);
      case "elegant":
        return this.generateElegantLayout(item, theme);
      case "modern-grid":
        return this.generateModernGridLayout(item, theme);
      case "multi-grid":
        return this.generateMultiGridLayout([item], theme);
      case "menu-style":
        return this.generateMenuStyleLayout([item], theme);
      default:
        return this.generateCenteredLayout(item, theme);
    }
  }

  private static getMultiItemLayoutSVG(
    items: MenuItem[],
    theme: MenuTheme,
    layout: MenuLayout
  ): string {
    switch (layout.id) {
      case "multi-grid":
        return this.generateMultiGridLayout(items, theme);
      case "menu-style":
        return this.generateMenuStyleLayout(items, theme);
      case "grid-2x2":
        return this.generateGrid2x2Layout(items, theme);
      case "grid-3x2":
        return this.generateGrid3x2Layout(items, theme);
      default:
        return this.generateMultiGridLayout(items, theme);
    }
  }

  private static generateCenteredLayout(
    item: MenuItem,
    theme: MenuTheme
  ): string {
    const bgColor = theme.backgroundColor;
    const darkerBg = this.adjustColor(bgColor, -30);
    const textColor = this.ensureContrast(theme.textColor, bgColor);
    const priceColor = this.ensureContrast(theme.priceColor, bgColor);
    const accentColor = theme.accentColor;

    const hasImage = item.image && item.image.trim() !== "";

    // Calculate positions based on whether image is present
    const imageY = 120;
    const imageHeight = 300;
    const titleY = hasImage ? imageY + imageHeight + 60 : 250;
    const descriptionY = hasImage ? titleY + 120 : titleY + 100;
    const priceY = hasImage ? descriptionY + 120 : descriptionY + 100;

    return `<svg width="1920" height="1080" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${darkerBg};stop-opacity:1" />
        </linearGradient>
        <filter id="titleGlow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id="textShadow">
          <feDropShadow dx="2" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.4"/>
        </filter>
        <filter id="imageShadow">
          <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.3"/>
        </filter>
      </defs>
      
      <rect width="100%" height="100%" fill="url(#bgGradient)"/>
      
      <!-- Decorative elements -->
      <circle cx="300" cy="300" r="200" fill="${accentColor}" opacity="0.08"/>
      <circle cx="1620" cy="780" r="180" fill="${accentColor}" opacity="0.08"/>
      <circle cx="1400" cy="200" r="120" fill="${accentColor}" opacity="0.05"/>
      
      ${this.generatePopularBadge(item, 1800, 80)}
      
      ${
        hasImage
          ? `
      <!-- Food Image -->
      <rect x="760" y="${imageY}" width="400" height="${imageHeight}" fill="#ffffff" opacity="0.1" rx="20" filter="url(#imageShadow)"/>
      <image href="${item.image}" x="770" y="${
              imageY + 10
            }" width="380" height="${
              imageHeight - 20
            }" preserveAspectRatio="xMidYMid slice" rx="15"/>
      `
          : ""
      }
      
      <!-- Main title with text wrapping -->
      ${this.generateWrappedText(
        item.name,
        960,
        titleY,
        80,
        textColor,
        "middle",
        "titleGlow",
        1400
      )}
      
      ${
        item.description
          ? `
      <!-- Description with text wrapping -->
      ${this.generateWrappedText(
        item.description,
        960,
        descriptionY,
        36,
        this.adjustColor(textColor, 40),
        "middle",
        "textShadow",
        1200
      )}
      `
          : ""
      }
      
      <!-- Price with decorative background -->
      <circle cx="960" cy="${priceY}" r="140" fill="${priceColor}" opacity="0.15"/>
      <text x="960" y="${priceY}" text-anchor="middle" dominant-baseline="middle" 
            font-family="Arial, Helvetica, sans-serif" font-size="84" font-weight="bold" 
            fill="${priceColor}" filter="url(#textShadow)">
        $${item.price}
      </text>
      
      ${this.generateDietaryBadges(item, "960")}
    </svg>`;
  }

  private static generateLeftAlignedLayout(
    item: MenuItem,
    theme: MenuTheme
  ): string {
    const bgColor = theme.backgroundColor;
    const darkerBg = this.adjustColor(bgColor, -25);
    const textColor = this.ensureContrast(theme.textColor, bgColor);
    const priceColor = this.ensureContrast(theme.priceColor, bgColor);
    const accentColor = theme.accentColor;

    const hasImage = item.image && item.image.trim() !== "";

    // Card and image positions
    const cardX = 120;
    const cardY = 100;
    const cardWidth = 1680;
    const cardHeight = 880;
    const imageX = cardX + 32;
    const imageY = cardY + 80;
    const imageWidth = 400;
    const imageHeight = 320;
    // Text area
    const textX = hasImage ? imageX + imageWidth + 48 : cardX + 80;
    const textMaxWidth = hasImage ? cardWidth - (imageWidth + 48 + 120) : 900;
    const titleY = cardY + 140;
    const descriptionY = titleY + 80;
    const priceY = cardY + cardHeight - 100;

    return `<svg width="1920" height="1080" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${darkerBg};stop-opacity:1" />
        </linearGradient>
        <filter id="textShadow">
          <feDropShadow dx="3" dy="3" stdDeviation="3" flood-color="#000000" flood-opacity="0.3"/>
        </filter>
        <filter id="imageShadow">
          <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.3"/>
        </filter>
      </defs>
      
      <rect width="100%" height="100%" fill="url(#bgGradient)"/>
      
      <!-- Card background -->
      <rect x="${cardX}" y="${cardY}" width="${cardWidth}" height="${cardHeight}" fill="#ffffff" opacity="0.97" rx="36"/>
      
      <!-- Left accent line -->
      <rect x="${cardX}" y="${cardY}" width="12" height="${cardHeight}" fill="${accentColor}"/>
      
      ${this.generatePopularBadge(
        item,
        cardX + cardWidth - 100,
        cardY + 60,
        "rect"
      )}
      
      ${
        hasImage
          ? `
      <!-- Food Image -->
      <rect x="${imageX}" y="${imageY}" width="${imageWidth}" height="${imageHeight}" fill="#ffffff" opacity="0.1" rx="20" filter="url(#imageShadow)"/>
      <image href="${item.image}" x="${imageX + 10}" y="${
              imageY + 10
            }" width="${imageWidth - 20}" height="${
              imageHeight - 20
            }" preserveAspectRatio="xMidYMid slice" rx="15"/>
      `
          : ""
      }
      
      <!-- Main title with text wrapping -->
      ${this.generateWrappedText(
        item.name,
        textX,
        titleY,
        64,
        textColor,
        "start",
        "textShadow",
        textMaxWidth
      )}
      
      ${
        item.description
          ? `
      <!-- Description with text wrapping -->
      ${this.generateWrappedText(
        item.description,
        textX,
        descriptionY,
        30,
        this.adjustColor(textColor, 50),
        "start",
        "",
        textMaxWidth
      )}
      `
          : ""
      }
      
      <!-- Price -->
      <text x="${
        textX + textMaxWidth - 32
      }" y="${priceY}" text-anchor="end" dominant-baseline="middle" 
            font-family="Arial, Helvetica, sans-serif" font-size="60" font-weight="bold" 
            fill="${priceColor}" filter="url(#textShadow)">
        $${item.price}
      </text>
      
      ${this.generateDietaryBadges(item, (textX + 32).toString(), "start")}
    </svg>`;
  }

  private static generateCardLayout(item: MenuItem, theme: MenuTheme): string {
    const bgColor = theme.backgroundColor;
    const darkerBg = this.adjustColor(bgColor, -35);
    // Force dark text for card backgrounds since they're white
    const textColor = "#000000";
    const priceColor = this.ensureContrast(theme.priceColor, "#ffffff");

    const hasImage = item.image && item.image.trim() !== "";

    // Card and image positions
    const cardX = 160;
    const cardY = 120;
    const cardWidth = 1600;
    const cardHeight = 840;
    const imageX = cardX + 48;
    const imageY = cardY + 80;
    const imageWidth = 420;
    const imageHeight = 340;
    // Text area
    const textX = hasImage ? imageX + imageWidth + 56 : cardX + cardWidth / 2;
    const textMaxWidth = hasImage ? cardWidth - (imageWidth + 56 + 96) : 900;
    const titleY = cardY + 140;
    const descriptionY = titleY + 96;
    const priceY = cardY + cardHeight - 120;

    return `<svg width="1920" height="1080" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${darkerBg};stop-opacity:1" />
        </linearGradient>
        <filter id="cardShadow">
          <feDropShadow dx="0" dy="15" stdDeviation="20" flood-color="#000000" flood-opacity="0.4"/>
        </filter>
        <filter id="textShadow">
          <feDropShadow dx="2" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.3"/>
        </filter>
        <filter id="imageShadow">
          <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.3"/>
        </filter>
      </defs>
      
      <rect width="100%" height="100%" fill="url(#bgGradient)"/>
      
      <!-- Card background -->
      <rect x="${cardX}" y="${cardY}" width="${cardWidth}" height="${cardHeight}" fill="#ffffff" opacity="0.95" 
            rx="40" filter="url(#cardShadow)"/>
      <rect x="${cardX + 20}" y="${cardY + 20}" width="${
      cardWidth - 40
    }" height="${cardHeight - 40}" fill="#ffffff" opacity="0.98" rx="35"/>
      
      ${this.generatePopularBadge(item, cardX + cardWidth - 120, cardY + 60)}
      
      ${
        hasImage
          ? `
      <!-- Food Image -->
      <rect x="${imageX}" y="${imageY}" width="${imageWidth}" height="${imageHeight}" fill="#f8f9fa" opacity="0.8" rx="25" filter="url(#imageShadow)"/>
      <image href="${item.image}" x="${imageX + 10}" y="${
              imageY + 10
            }" width="${imageWidth - 20}" height="${
              imageHeight - 20
            }" preserveAspectRatio="xMidYMid slice" rx="20"/>
      `
          : ""
      }
      
      <!-- Main title with text wrapping -->
      ${this.generateWrappedText(
        item.name,
        textX,
        titleY,
        80,
        textColor,
        "start",
        "textShadow",
        textMaxWidth
      )}
      
      ${
        item.description
          ? `
      <!-- Description with text wrapping -->
      ${this.generateWrappedText(
        item.description,
        textX,
        descriptionY,
        36,
        "#666666",
        "start",
        "",
        textMaxWidth
      )}
      `
          : ""
      }
      
      <!-- Price -->
      <text x="${
        textX + textMaxWidth - 40
      }" y="${priceY}" text-anchor="end" dominant-baseline="middle" 
            font-family="Arial, Helvetica, sans-serif" font-size="72" font-weight="bold" 
            fill="${priceColor}" filter="url(#textShadow)">
        $${item.price}
      </text>
      
      ${this.generateDietaryBadges(item, (textX + 40).toString(), "start")}
    </svg>`;
  }

  private static generateMinimalLayout(
    item: MenuItem,
    theme: MenuTheme
  ): string {
    const bgColor = theme.backgroundColor;
    const darkerBg = this.adjustColor(bgColor, -15);
    const textColor = this.ensureContrast(theme.textColor, bgColor);
    const priceColor = this.ensureContrast(theme.priceColor, bgColor);
    const accentColor = theme.accentColor;

    const hasImage = item.image && item.image.trim() !== "";

    // Card and image positions
    const cardX = 180;
    const cardY = 140;
    const cardWidth = 1560;
    const cardHeight = 800;
    const imageX = cardX + 32;
    const imageY = cardY + 60;
    const imageWidth = 360;
    const imageHeight = 260;
    // Text area
    const textX = hasImage ? imageX + imageWidth + 40 : cardX + cardWidth / 2;
    const textMaxWidth = hasImage ? cardWidth - (imageWidth + 40 + 80) : 900;
    const titleY = cardY + 120;
    const descriptionY = titleY + 72;
    const priceY = cardY + cardHeight - 80;

    return `<svg width="1920" height="1080" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${darkerBg};stop-opacity:1" />
        </linearGradient>
        <filter id="imageShadow">
          <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.3"/>
        </filter>
      </defs>
      
      <rect width="100%" height="100%" fill="url(#bgGradient)"/>
      
      <!-- Card background -->
      <rect x="${cardX}" y="${cardY}" width="${cardWidth}" height="${cardHeight}" fill="#ffffff" opacity="0.98" rx="32"/>
      
      <!-- Minimal accent line -->
      <rect x="${cardX}" y="${cardY}" width="100%" height="6" fill="${accentColor}"/>
      
      ${this.generatePopularBadge(
        item,
        cardX + cardWidth - 80,
        cardY + 40,
        "text"
      )}
      
      ${
        hasImage
          ? `
      <!-- Food Image -->
      <rect x="${imageX}" y="${imageY}" width="${imageWidth}" height="${imageHeight}" fill="#ffffff" opacity="0.1" rx="20" filter="url(#imageShadow)"/>
      <image href="${item.image}" x="${imageX + 8}" y="${imageY + 8}" width="${
              imageWidth - 16
            }" height="${
              imageHeight - 16
            }" preserveAspectRatio="xMidYMid slice" rx="15"/>
      `
          : ""
      }
      
      <!-- Main title with text wrapping -->
      ${this.generateWrappedText(
        item.name,
        textX,
        titleY,
        48,
        textColor,
        "start",
        "",
        textMaxWidth
      )}
      
      ${
        item.description
          ? `
      <!-- Description with text wrapping -->
      ${this.generateWrappedText(
        item.description,
        textX,
        descriptionY,
        24,
        this.adjustColor(textColor, 70),
        "start",
        "",
        textMaxWidth
      )}
      `
          : ""
      }
      
      <!-- Price -->
      <text x="${
        textX + textMaxWidth - 24
      }" y="${priceY}" text-anchor="end" dominant-baseline="middle" 
            font-family="Arial, Helvetica, sans-serif" font-size="48" font-weight="bold" 
            fill="${priceColor}">
        $${item.price}
      </text>
      
      ${this.generateDietaryBadges(
        item,
        (textX + 24).toString(),
        "start",
        true
      )}
    </svg>`;
  }

  private static generateElegantLayout(
    item: MenuItem,
    theme: MenuTheme
  ): string {
    const bgColor = theme.backgroundColor;
    const darkerBg = this.adjustColor(bgColor, -40);
    // Use dark text for white card background
    const textColor = "#000000";
    const priceColor = "#000000";
    const descriptionColor = "#666666";
    const accentColor = theme.accentColor;

    const hasImage = item.image && item.image.trim() !== "";

    // Card and image positions
    const cardX = 160;
    const cardY = 80;
    const cardWidth = 1600;
    const cardHeight = 920;
    const imageX = cardX + (cardWidth - 400) / 2;
    const imageY = cardY + 60;
    const imageWidth = 400;
    const imageHeight = 300;
    // Text area
    const textX = cardX + cardWidth / 2;
    const textMaxWidth = 1200;
    const titleY = hasImage ? imageY + imageHeight + 80 : cardY + 200;
    const descriptionY = titleY + 100;
    const priceY = cardY + cardHeight - 100;

    return `<svg width="1920" height="1080" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${darkerBg};stop-opacity:1" />
        </linearGradient>
        <filter id="elegantGlow">
          <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id="imageShadow">
          <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.3"/>
        </filter>
        <filter id="cardShadow">
          <feDropShadow dx="0" dy="15" stdDeviation="20" flood-color="#000000" flood-opacity="0.15"/>
        </filter>
      </defs>
      
      <rect width="100%" height="100%" fill="url(#bgGradient)"/>
      
      <!-- Elegant decorative elements -->
      <circle cx="400" cy="400" r="250" fill="${accentColor}" opacity="0.06"/>
      <circle cx="1520" cy="680" r="220" fill="${accentColor}" opacity="0.06"/>
      <circle cx="1200" cy="300" r="150" fill="${accentColor}" opacity="0.04"/>
      
      <!-- Decorative lines -->
      <line x1="0" y1="200" x2="500" y2="200" stroke="${accentColor}" stroke-width="3" opacity="0.3"/>
      <line x1="1420" y1="880" x2="1920" y2="880" stroke="${accentColor}" stroke-width="3" opacity="0.3"/>
      
      <!-- Card background -->
      <rect x="${cardX}" y="${cardY}" width="${cardWidth}" height="${cardHeight}" fill="#ffffff" opacity="0.98" rx="40" filter="url(#cardShadow)"/>
      
      ${this.generatePopularBadge(item, cardX + cardWidth - 80, cardY + 40)}
      
      ${
        hasImage
          ? `
      <!-- Food Image -->
      <rect x="${imageX}" y="${imageY}" width="${imageWidth}" height="${imageHeight}" fill="#f8f9fa" opacity="0.8" rx="20" filter="url(#imageShadow)"/>
      <image href="${item.image}" x="${imageX + 8}" y="${imageY + 8}" width="${
              imageWidth - 16
            }" height="${
              imageHeight - 16
            }" preserveAspectRatio="xMidYMid slice" rx="15"/>
      `
          : ""
      }
      
      <!-- Main title with text wrapping -->
      ${this.generateWrappedText(
        item.name,
        textX,
        titleY,
        72,
        textColor,
        "middle",
        "",
        textMaxWidth
      )}
      
      ${
        item.description
          ? `
      <!-- Description with text wrapping -->
      ${this.generateWrappedText(
        item.description,
        textX,
        descriptionY,
        32,
        descriptionColor,
        "middle",
        "",
        textMaxWidth
      )}
      `
          : ""
      }
      
      <!-- Price -->
      <text x="${textX}" y="${priceY}" text-anchor="middle" dominant-baseline="middle" 
            font-family="Arial, Helvetica, sans-serif" font-size="72" font-weight="bold" 
            fill="${priceColor}">
        $${item.price}
      </text>
      
      ${this.generateDietaryBadges(item, textX.toString(), "middle")}
    </svg>`;
  }

  private static generateModernGridLayout(
    item: MenuItem,
    theme: MenuTheme
  ): string {
    const bgColor = theme.backgroundColor;
    const darkerBg = this.adjustColor(bgColor, -20);
    // Force dark text for white card backgrounds
    const cardTextColor = "#000000";
    const cardPriceColor = "#000000";
    const cardDescColor = "#666666";
    const titleColor = this.getSafeTextColor(bgColor);
    const accentColor = theme.accentColor;

    const hasImage = item.image && item.image.trim() !== "";

    // Card and image positions
    const cardX = 160;
    const cardY = 80;
    const cardWidth = 1600;
    const cardHeight = 920;
    const imageX = cardX + (cardWidth - 400) / 2;
    const imageY = cardY + 60;
    const imageWidth = 400;
    const imageHeight = 300;
    // Text area
    const textX = cardX + cardWidth / 2;
    const textMaxWidth = 1200;
    const titleY = hasImage ? imageY + imageHeight + 80 : cardY + 200;
    const descriptionY = titleY + 100;
    const priceY = cardY + cardHeight - 100;

    return `<svg width="1920" height="1080" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${darkerBg};stop-opacity:1" />
        </linearGradient>
        <filter id="modernShadow">
          <feDropShadow dx="0" dy="10" stdDeviation="15" flood-color="#000000" flood-opacity="0.25"/>
        </filter>
        <filter id="imageShadow">
          <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.3"/>
        </filter>
        <filter id="cardShadow">
          <feDropShadow dx="0" dy="15" stdDeviation="20" flood-color="#000000" flood-opacity="0.15"/>
        </filter>
        <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M 80 0 L 0 0 0 80" fill="none" stroke="${accentColor}" stroke-width="1" opacity="0.12"/>
        </pattern>
      </defs>
      
      <rect width="100%" height="100%" fill="url(#bgGradient)"/>
      <rect width="100%" height="100%" fill="url(#grid)"/>
      
      <!-- Card background -->
      <rect x="${cardX}" y="${cardY}" width="${cardWidth}" height="${cardHeight}" fill="#ffffff" opacity="0.98" rx="40" filter="url(#cardShadow)"/>
      
      ${this.generatePopularBadge(item, cardX + cardWidth - 80, cardY + 40)}
      
      ${
        hasImage
          ? `
      <!-- Food Image -->
      <rect x="${imageX}" y="${imageY}" width="${imageWidth}" height="${imageHeight}" fill="#f8f9fa" opacity="0.8" rx="20" filter="url(#imageShadow)"/>
      <image href="${item.image}" x="${imageX + 8}" y="${imageY + 8}" width="${
              imageWidth - 16
            }" height="${
              imageHeight - 16
            }" preserveAspectRatio="xMidYMid slice" rx="15"/>
      `
          : ""
      }
      
      <!-- Main title with text wrapping -->
      ${this.generateWrappedText(
        item.name,
        textX,
        titleY,
        72,
        cardTextColor,
        "middle",
        "",
        textMaxWidth
      )}
      
      ${
        item.description
          ? `
      <!-- Description with text wrapping -->
      ${this.generateWrappedText(
        item.description,
        textX,
        descriptionY,
        28,
        cardDescColor,
        "middle",
        "",
        textMaxWidth
      )}
      `
          : ""
      }
      
      <!-- Price -->
      <text x="${textX}" y="${priceY}" text-anchor="middle" dominant-baseline="middle" 
            font-family="Arial, Helvetica, sans-serif" font-size="72" font-weight="bold" 
            fill="${cardPriceColor}">
        $${item.price}
      </text>
      
      ${this.generateDietaryBadges(item, textX.toString(), "middle")}
    </svg>`;
  }

  // New multi-item layouts with better text handling
  private static generateMultiGridLayout(
    items: MenuItem[],
    theme: MenuTheme
  ): string {
    const bgColor = theme.backgroundColor;
    const darkerBg = this.adjustColor(bgColor, -20);
    // Force dark text for white card backgrounds
    const cardTextColor = "#000000";
    const cardPriceColor = "#000000";
    const cardDescColor = "#666666";
    const titleColor = this.getSafeTextColor(bgColor);
    const accentColor = theme.accentColor;

    const maxItems = Math.min(items.length, 6);
    const itemsPerRow = 3;
    const rows = Math.ceil(maxItems / itemsPerRow);

    let itemsHtml = "";
    for (let i = 0; i < maxItems; i++) {
      const item = items[i];
      const row = Math.floor(i / itemsPerRow);
      const col = i % itemsPerRow;
      const x = 200 + col * 520;
      const y = 150 + row * 480; // Increased spacing between rows
      const hasImage = item.image && item.image.trim() !== "";

      // Calculate positions within each card
      const imageWidth = 200;
      const imageHeight = 140;
      const textX = hasImage ? x + 240 : x + 40;
      const titleY = y + 80;
      const descriptionY = y + 140;
      const priceY = y + 380; // Moved price lower to allow more description space

      itemsHtml += `
        <!-- Item ${i + 1} -->
        <rect x="${x}" y="${y}" width="480" height="420" fill="#ffffff" opacity="0.95" rx="20" filter="url(#cardShadow)"/>
        <rect x="${x + 10}" y="${
        y + 10
      }" width="460" height="400" fill="#ffffff" opacity="0.98" rx="15"/>
        
        ${
          hasImage
            ? `
        <!-- Food Image -->
        <rect x="${x + 20}" y="${
                y + 20
              }" width="${imageWidth}" height="${imageHeight}" fill="#f8f9fa" opacity="0.8" rx="15" filter="url(#imageShadow)"/>
        <image href="${item.image}" x="${x + 25}" y="${y + 25}" width="${
                imageWidth - 10
              }" height="${
                imageHeight - 10
              }" preserveAspectRatio="xMidYMid slice" rx="10"/>
        `
            : ""
        }
        
        ${this.generateWrappedText(
          item.name,
          textX,
          titleY,
          24,
          cardTextColor,
          "start",
          "",
          hasImage ? 200 : 400
        )}
        
        ${
          item.description
            ? `
        ${this.generateWrappedText(
          item.description,
          textX,
          descriptionY,
          14,
          cardDescColor,
          "start",
          "",
          hasImage ? 200 : 400
        )}
        `
            : ""
        }
        
        <text x="${textX}" y="${priceY}" text-anchor="start" dominant-baseline="middle" 
              font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="bold" 
              fill="${cardPriceColor}">
          $${item.price}
        </text>
        
        ${this.generatePopularBadge(item, x + 440, y + 30)}
      `;
    }

    return `<svg width="1920" height="1080" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${darkerBg};stop-opacity:1" />
        </linearGradient>
        <filter id="cardShadow">
          <feDropShadow dx="0" dy="12" stdDeviation="15" flood-color="#000000" flood-opacity="0.25"/>
        </filter>
        <filter id="imageShadow">
          <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000000" flood-opacity="0.2"/>
        </filter>
        <filter id="titleGlow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <rect width="100%" height="100%" fill="url(#bgGradient)"/>
      
      <!-- Decorative elements -->
      <circle cx="300" cy="300" r="200" fill="${accentColor}" opacity="0.05"/>
      <circle cx="1620" cy="780" r="180" fill="${accentColor}" opacity="0.05"/>
      
      <!-- Title -->
      <text x="960" y="80" text-anchor="middle" dominant-baseline="middle" 
            font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="bold" 
            fill="${titleColor}" filter="url(#titleGlow)">
        Our Menu
      </text>
      
      ${itemsHtml}
    </svg>`;
  }

  private static generateMenuStyleLayout(
    items: MenuItem[],
    theme: MenuTheme
  ): string {
    const bgColor = theme.backgroundColor;
    const darkerBg = this.adjustColor(bgColor, -25);
    // Force dark text for white backgrounds
    const cardTextColor = "#000000";
    const cardPriceColor = "#000000";
    const cardDescColor = "#666666";
    const titleColor = this.getSafeTextColor(bgColor);
    const accentColor = theme.accentColor;

    const maxItems = Math.min(items.length, 8);
    const itemHeight = 140; // Increased height for better spacing
    const startY = 200;

    let itemsHtml = "";
    for (let i = 0; i < maxItems; i++) {
      const item = items[i];
      const y = startY + i * itemHeight;
      const hasImage = item.image && item.image.trim() !== "";

      // Calculate positions within each item
      const imageWidth = 120;
      const imageHeight = 100;
      const textX = hasImage ? 370 : 240;
      const titleY = y + 45;
      const descriptionY = y + 75;
      const priceX = 1600;

      itemsHtml += `
        <!-- Item ${i + 1} -->
        <rect x="200" y="${y}" width="1520" height="${
        itemHeight - 20
      }" fill="#ffffff" opacity="0.95" rx="15" filter="url(#cardShadow)"/>
        
        ${
          hasImage
            ? `
        <!-- Food Image -->
        <rect x="220" y="${
          y + 10
        }" width="${imageWidth}" height="${imageHeight}" fill="#f8f9fa" opacity="0.8" rx="10" filter="url(#imageShadow)"/>
        <image href="${item.image}" x="${225}" y="${y + 15}" width="${
                imageWidth - 10
              }" height="${
                imageHeight - 10
              }" preserveAspectRatio="xMidYMid slice" rx="8"/>
        `
            : ""
        }
        
        ${this.generateWrappedText(
          item.name,
          textX,
          titleY,
          28,
          cardTextColor,
          "start",
          "",
          hasImage ? 500 : 600
        )}
        
        ${
          item.description
            ? `
        ${this.generateWrappedText(
          item.description,
          textX,
          descriptionY,
          16,
          cardDescColor,
          "start",
          "",
          hasImage ? 500 : 600
        )}
        `
            : ""
        }
        
        <text x="${priceX}" y="${
        y + 50
      }" text-anchor="end" dominant-baseline="middle" 
              font-family="Arial, Helvetica, sans-serif" font-size="36" font-weight="bold" 
              fill="${cardPriceColor}">
          $${item.price}
        </text>
        
        ${this.generatePopularBadge(item, 1800, y + 30, "text")}
      `;
    }

    return `<svg width="1920" height="1080" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${darkerBg};stop-opacity:1" />
        </linearGradient>
        <filter id="imageShadow">
          <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.2"/>
        </filter>
        <filter id="cardShadow">
          <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#000000" flood-opacity="0.15"/>
        </filter>
        <filter id="titleGlow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <rect width="100%" height="100%" fill="url(#bgGradient)"/>
      
      <!-- Decorative elements -->
      <circle cx="400" cy="400" r="250" fill="${accentColor}" opacity="0.04"/>
      <circle cx="1520" cy="680" r="220" fill="${accentColor}" opacity="0.04"/>
      
      <!-- Title -->
      <text x="960" y="120" text-anchor="middle" dominant-baseline="middle" 
            font-family="Arial, Helvetica, sans-serif" font-size="72" font-weight="bold" 
            fill="${titleColor}" filter="url(#titleGlow)">
        Menu
      </text>
      
      ${itemsHtml}
    </svg>`;
  }

  private static generateGrid2x2Layout(
    items: MenuItem[],
    theme: MenuTheme
  ): string {
    const bgColor = theme.backgroundColor;
    const darkerBg = this.adjustColor(bgColor, -20);
    // Force dark text for white backgrounds
    const cardTextColor = "#000000";
    const cardPriceColor = "#000000";
    const cardDescColor = "#666666";
    const titleColor = this.getSafeTextColor(bgColor);

    const maxItems = Math.min(items.length, 4);

    let itemsHtml = "";
    for (let i = 0; i < maxItems; i++) {
      const item = items[i];
      const row = Math.floor(i / 2);
      const col = i % 2;
      const x = 200 + col * 800;
      const y = 200 + row * 520; // Increased spacing between rows
      const hasImage = item.image && item.image.trim() !== "";

      // Calculate positions within each card
      const imageWidth = 280;
      const imageHeight = 200;
      const textX = hasImage ? x + 380 : x + 40;
      const titleY = y + 90;
      const descriptionY = y + 170;
      const priceY = y + 420; // Moved price lower to allow more description space

      itemsHtml += `
        <!-- Item ${i + 1} -->
        <rect x="${x}" y="${y}" width="720" height="480" fill="#ffffff" opacity="0.95" rx="25" filter="url(#cardShadow)"/>
        <rect x="${x + 15}" y="${
        y + 15
      }" width="690" height="450" fill="#ffffff" opacity="0.98" rx="20"/>
        
        ${
          hasImage
            ? `
        <!-- Food Image -->
        <rect x="${x + 30}" y="${
                y + 30
              }" width="${imageWidth}" height="${imageHeight}" fill="#f8f9fa" opacity="0.8" rx="15" filter="url(#imageShadow)"/>
        <image href="${item.image}" x="${x + 35}" y="${y + 35}" width="${
                imageWidth - 10
              }" height="${
                imageHeight - 10
              }" preserveAspectRatio="xMidYMid slice" rx="12"/>
        `
            : ""
        }
        
        ${this.generateWrappedText(
          item.name,
          textX,
          titleY,
          32,
          cardTextColor,
          "start",
          "",
          hasImage ? 300 : 600
        )}
        
        ${
          item.description
            ? `
        ${this.generateWrappedText(
          item.description,
          textX,
          descriptionY,
          18,
          cardDescColor,
          "start",
          "",
          hasImage ? 300 : 600
        )}
        `
            : ""
        }
        
        <text x="${textX}" y="${priceY}" text-anchor="start" dominant-baseline="middle" 
              font-family="Arial, Helvetica, sans-serif" font-size="40" font-weight="bold" 
              fill="${cardPriceColor}">
          $${item.price}
        </text>
        
        ${this.generatePopularBadge(item, x + 680, y + 50)}
      `;
    }

    return `<svg width="1920" height="1080" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${darkerBg};stop-opacity:1" />
        </linearGradient>
        <filter id="cardShadow">
          <feDropShadow dx="0" dy="15" stdDeviation="20" flood-color="#000000" flood-opacity="0.3"/>
        </filter>
        <filter id="imageShadow">
          <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#000000" flood-opacity="0.2"/>
        </filter>
        <filter id="titleGlow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <rect width="100%" height="100%" fill="url(#bgGradient)"/>
      
      <!-- Decorative elements -->
      <circle cx="300" cy="300" r="200" fill="${theme.accentColor}" opacity="0.05"/>
      <circle cx="1620" cy="780" r="180" fill="${theme.accentColor}" opacity="0.05"/>
      
      <!-- Title -->
      <text x="960" y="120" text-anchor="middle" dominant-baseline="middle" 
            font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="bold" 
            fill="${titleColor}" filter="url(#titleGlow)">
        Featured Items
      </text>
      
      ${itemsHtml}
    </svg>`;
  }

  private static generateGrid3x2Layout(
    items: MenuItem[],
    theme: MenuTheme
  ): string {
    const bgColor = theme.backgroundColor;
    const darkerBg = this.adjustColor(bgColor, -20);
    // Force dark text for white backgrounds
    const cardTextColor = "#000000";
    const cardPriceColor = "#000000";
    const cardDescColor = "#666666";
    const titleColor = this.getSafeTextColor(bgColor);

    const maxItems = Math.min(items.length, 6);

    let itemsHtml = "";
    for (let i = 0; i < maxItems; i++) {
      const item = items[i];
      const row = Math.floor(i / 3);
      const col = i % 3;
      const x = 100 + col * 580;
      const y = 200 + row * 460; // Increased spacing between rows
      const hasImage = item.image && item.image.trim() !== "";

      // Calculate positions within each card
      const imageWidth = 200;
      const imageHeight = 140;
      const textX = hasImage ? x + 240 : x + 40;
      const titleY = y + 80;
      const descriptionY = y + 140;
      const priceY = y + 360; // Moved price lower to allow more description space

      itemsHtml += `
        <!-- Item ${i + 1} -->
        <rect x="${x}" y="${y}" width="520" height="400" fill="#ffffff" opacity="0.95" rx="20" filter="url(#cardShadow)"/>
        <rect x="${x + 10}" y="${
        y + 10
      }" width="500" height="380" fill="#ffffff" opacity="0.98" rx="15"/>
        
        ${
          hasImage
            ? `
        <!-- Food Image -->
        <rect x="${x + 20}" y="${
                y + 20
              }" width="${imageWidth}" height="${imageHeight}" fill="#f8f9fa" opacity="0.8" rx="12" filter="url(#imageShadow)"/>
        <image href="${item.image}" x="${x + 25}" y="${y + 25}" width="${
                imageWidth - 10
              }" height="${
                imageHeight - 10
              }" preserveAspectRatio="xMidYMid slice" rx="10"/>
        `
            : ""
        }
        
        ${this.generateWrappedText(
          item.name,
          textX,
          titleY,
          24,
          cardTextColor,
          "start",
          "",
          hasImage ? 200 : 460
        )}
        
        ${
          item.description
            ? `
        ${this.generateWrappedText(
          item.description,
          textX,
          descriptionY,
          14,
          cardDescColor,
          "start",
          "",
          hasImage ? 200 : 460
        )}
        `
            : ""
        }
        
        <text x="${textX}" y="${priceY}" text-anchor="start" dominant-baseline="middle" 
              font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="bold" 
              fill="${cardPriceColor}">
          $${item.price}
        </text>
        
        ${this.generatePopularBadge(item, x + 480, y + 30)}
      `;
    }

    return `<svg width="1920" height="1080" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${darkerBg};stop-opacity:1" />
        </linearGradient>
        <filter id="cardShadow">
          <feDropShadow dx="0" dy="12" stdDeviation="15" flood-color="#000000" flood-opacity="0.25"/>
        </filter>
        <filter id="imageShadow">
          <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000000" flood-opacity="0.2"/>
        </filter>
        <filter id="titleGlow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <rect width="100%" height="100%" fill="url(#bgGradient)"/>
      
      <!-- Decorative elements -->
      <circle cx="300" cy="300" r="200" fill="${theme.accentColor}" opacity="0.05"/>
      <circle cx="1620" cy="780" r="180" fill="${theme.accentColor}" opacity="0.05"/>
      
      <!-- Title -->
      <text x="960" y="120" text-anchor="middle" dominant-baseline="middle" 
            font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="bold" 
            fill="${titleColor}" filter="url(#titleGlow)">
        Our Menu
      </text>
      
      ${itemsHtml}
    </svg>`;
  }

  // Helper function to generate wrapped text with better positioning
  private static generateWrappedText(
    text: string,
    x: number,
    y: number,
    fontSize: number,
    color: string,
    anchor: string,
    filter: string,
    maxWidth: number
  ): string {
    if (!text || text.trim() === "") {
      return "";
    }

    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    // Better width estimation based on font size
    const getCharWidth = (char: string, size: number) => {
      // More accurate character width estimation
      if (char === " ") return size * 0.3;
      if (char === "i" || char === "l" || char === "I") return size * 0.4;
      if (char === "w" || char === "W" || char === "m" || char === "M")
        return size * 0.8;
      return size * 0.6; // Average character width
    };

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      let estimatedWidth = 0;

      // Calculate width more accurately
      for (const char of testLine) {
        estimatedWidth += getCharWidth(char, fontSize);
      }

      if (estimatedWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          // If a single word is too long, break it
          let wordWidth = 0;
          let breakPoint = 0;
          for (let i = 0; i < word.length; i++) {
            wordWidth += getCharWidth(word[i], fontSize);
            if (wordWidth <= maxWidth) {
              breakPoint = i + 1;
            } else {
              break;
            }
          }

          if (breakPoint > 0) {
            lines.push(word.substring(0, breakPoint));
            currentLine = word.substring(breakPoint);
          } else {
            // If even one character is too wide, just add the word
            lines.push(word);
          }
        }
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    // More flexible line limits based on font size and content type
    let maxLines: number;
    if (fontSize <= 16) {
      // Small text (descriptions in cards) - allow more lines
      maxLines = 8;
    } else if (fontSize <= 24) {
      // Medium text (descriptions in single layouts) - allow more lines
      maxLines = 6;
    } else if (fontSize <= 32) {
      // Larger text (titles) - allow more lines
      maxLines = 4;
    } else {
      // Very large text (main titles) - limit to 2 lines
      maxLines = 2;
    }

    // Only truncate if absolutely necessary (very long descriptions)
    if (lines.length > maxLines) {
      // For descriptions, try to show more content by increasing maxLines
      if (fontSize <= 24) {
        maxLines = Math.min(maxLines + 2, 10); // Allow up to 10 lines for descriptions
      }

      if (lines.length > maxLines) {
        lines.splice(maxLines);
        // Only add ellipsis for very long content
        if (lines[maxLines - 1] && fontSize <= 24) {
          const lastLine = lines[maxLines - 1];
          let truncatedLine = lastLine;
          let width = 0;

          // Calculate width of last line with ellipsis
          for (const char of lastLine) {
            width += getCharWidth(char, fontSize);
          }
          width += getCharWidth(".", fontSize) * 3; // Add space for "..."

          // If still too wide, truncate more
          if (width > maxWidth) {
            let newWidth = 0;
            let newBreakPoint = 0;
            for (let i = 0; i < lastLine.length; i++) {
              newWidth += getCharWidth(lastLine[i], fontSize);
              if (newWidth + getCharWidth(".", fontSize) * 3 <= maxWidth) {
                newBreakPoint = i + 1;
              } else {
                break;
              }
            }
            truncatedLine = lastLine.substring(0, newBreakPoint);
          }

          lines[maxLines - 1] = truncatedLine + "...";
        }
      }
    }

    let html = "";
    const lineHeight = fontSize * 1.3; // Slightly tighter line height for more content
    const totalHeight = lines.length * lineHeight;

    // Calculate starting Y position based on anchor
    let startY: number;
    if (anchor === "middle") {
      startY = y - totalHeight / 2 + lineHeight / 2;
    } else {
      startY = y;
    }

    for (let i = 0; i < lines.length; i++) {
      const lineY = startY + i * lineHeight;
      html += `
        <text x="${x}" y="${lineY}" text-anchor="${anchor}" dominant-baseline="middle" 
              font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" 
              fill="${color}" ${filter ? `filter="url(#${filter})"` : ""}>
          ${this.escapeXml(lines[i])}
        </text>
      `;
    }

    return html;
  }

  // Helper function to ensure text contrast
  private static ensureContrast(textColor: string, bgColor: string): string {
    // If background is white or very light, use dark text
    if (
      bgColor.toLowerCase() === "#ffffff" ||
      bgColor.toLowerCase() === "#fff"
    ) {
      return "#000000";
    }

    // If background is very light (high brightness), use dark text
    const bgBrightness = this.getBrightness(bgColor);
    if (bgBrightness > 200) {
      return "#000000";
    }

    // If background is very dark (low brightness), use light text
    if (bgBrightness < 50) {
      return "#ffffff";
    }

    // For medium brightness, check contrast ratio
    const textBrightness = this.getBrightness(textColor);
    const contrastRatio = Math.abs(textBrightness - bgBrightness);

    if (contrastRatio < 150) {
      return bgBrightness > 128 ? "#000000" : "#ffffff";
    }

    return textColor;
  }

  // Helper function to get safe text color for white backgrounds
  private static getSafeTextColor(bgColor: string): string {
    if (
      bgColor.toLowerCase() === "#ffffff" ||
      bgColor.toLowerCase() === "#fff"
    ) {
      return "#000000";
    }

    const bgBrightness = this.getBrightness(bgColor);
    if (bgBrightness > 180) {
      return "#000000";
    }

    return "#ffffff";
  }

  private static getBrightness(color: string): number {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return (r * 299 + g * 587 + b * 114) / 1000;
  }

  private static generatePopularBadge(
    item: MenuItem,
    x: number,
    y: number,
    type: "rect" | "text" = "rect"
  ): string {
    if (!item.isPopular) return "";

    if (type === "rect") {
      return `
        <rect x="${
          x - 80
        }" y="${y}" width="80" height="30" fill="#ff6b6b" rx="15"/>
        <text x="${x - 40}" y="${
        y + 15
      }" text-anchor="middle" dominant-baseline="middle" 
              font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="bold" 
              fill="#ffffff">
          POPULAR
        </text>
      `;
    } else {
      return `
        <text x="${x}" y="${y}" text-anchor="end" dominant-baseline="middle" 
              font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="bold" 
              fill="#ff6b6b">
          ★ POPULAR
        </text>
      `;
    }
  }

  private static generateDietaryBadges(
    item: MenuItem,
    x: string,
    anchor: "start" | "middle" | "end" = "middle",
    minimal: boolean = false
  ): string {
    if (!item.dietaryInfo || item.dietaryInfo.length === 0) return "";

    const badges = item.dietaryInfo
      .map((info, index) => {
        const badgeX =
          anchor === "start"
            ? parseInt(x) + index * 100
            : anchor === "end"
            ? parseInt(x) - index * 100
            : parseInt(x) - (item.dietaryInfo!.length - 1) * 50 + index * 100;

        const colors: { [key: string]: string } = {
          Vegetarian: "#4ade80",
          Vegan: "#22c55e",
          Spicy: "#f97316",
          "Gluten-Free": "#8b5cf6",
          Halal: "#06b6d4",
          Kosher: "#3b82f6",
        };

        const bgColor = colors[info] || "#6b7280";

        if (minimal) {
          return `
          <text x="${badgeX}" y="800" text-anchor="middle" dominant-baseline="middle" 
                font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="bold" 
                fill="${bgColor}">
            ${info}
          </text>
        `;
        } else {
          return `
          <rect x="${
            badgeX - 40
          }" y="780" width="80" height="25" fill="${bgColor}" opacity="0.9" rx="12"/>
          <text x="${badgeX}" y="792" text-anchor="middle" dominant-baseline="middle" 
                font-family="Arial, Helvetica, sans-serif" font-size="10" font-weight="bold" 
                fill="#ffffff">
            ${info}
          </text>
        `;
        }
      })
      .join("");

    return badges;
  }

  private static escapeXml(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  private static adjustColor(color: string, amount: number): string {
    // Handle undefined or null color values
    if (!color) {
      return "#000000"; // Default to black if no color provided
    }

    const hex = color.replace("#", "");
    const num = parseInt(hex, 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000ff) + amount));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
  }
}
