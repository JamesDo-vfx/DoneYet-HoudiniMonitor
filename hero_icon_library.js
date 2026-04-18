const DEFAULT_ICON_LIBRARY = "lucide";
const DEFAULT_HERO_ICON = "building-2";

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

function getLucideIconPath(iconName) {
    return `./vendor/lucide/icons/${normalizeIconName(iconName)}.svg`;
}

export function renderDecorativeHeroIcon(iconLibrary, iconName) {
    const library = normalizeIconLibrary(iconLibrary);
    const normalizedName = normalizeIconName(iconName);
    const iconPath = library === "lucide"
        ? getLucideIconPath(normalizedName)
        : getLucideIconPath(DEFAULT_HERO_ICON);
    return `<span class="overview-hero__bg-svg" style="--hero-icon-mask: url('${iconPath}');"></span>`;
}
