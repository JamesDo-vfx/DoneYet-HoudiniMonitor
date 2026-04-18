const DEFAULT_ICON_LIBRARY = "lucide";
const DEFAULT_HERO_ICON = "building-2";
const LUCIDE_SPRITE_PATH = "/vendor/lucide/sprite.svg";

function normalizeIconLibrary(iconLibrary) {
    return String(iconLibrary || "").trim().toLowerCase() === "lucide" ? "lucide" : DEFAULT_ICON_LIBRARY;
}

function normalizeIconName(iconName) {
    const normalized = String(iconName || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
    return normalized || DEFAULT_HERO_ICON;
}

function getLucideSpriteHref(iconName) {
    return `${LUCIDE_SPRITE_PATH}#${encodeURIComponent(normalizeIconName(iconName))}`;
}

export function renderDecorativeHeroIcon(iconLibrary, iconName) {
    const library = normalizeIconLibrary(iconLibrary);
    const normalizedName = normalizeIconName(iconName);
    const iconHref = library === "lucide"
        ? getLucideSpriteHref(normalizedName)
        : getLucideSpriteHref(DEFAULT_HERO_ICON);
    return `<svg class="overview-hero__bg-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="${iconHref}"></use></svg>`;
}
