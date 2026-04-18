export const STORAGE_KEY = "doneyet_web_config_v1";

const DEFAULT_ACCENT_COLOR = "#51ff84";
const DEFAULT_THEME_MODE = "dark";
const DEFAULT_COMPANY_NAME_COLOR = "#98a5ba";
const DEFAULT_ICON_LIBRARY = "lucide";
const DEFAULT_HERO_BACKGROUND_ICON = "building-2";
const DEFAULT_HERO_ICON_COLOR = "#FFFFFF";
const DEFAULT_HERO_ICON_OPACITY = 0.08;
const DEFAULT_HERO_ICON_SCALE = 1.0;
const DEFAULT_HERO_ICON_HOVER_SCALE = 1.06;
const FIXED_BRAND_LABEL = "DoneYet Monitor";

function clonePlainObject(value) {
    return JSON.parse(JSON.stringify(value));
}

function makeError(code, message) {
    const error = new Error(message);
    error.code = code;
    return error;
}

function sanitizePastedJsonText(rawText) {
    return String(rawText || "")
        .replace(/^\uFEFF/, "")
        .replace(/[\u201C\u201D]/g, "\"")
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/\u00A0/g, " ")
        .replace(/[\u200B-\u200D\u2060]/g, "");
}

function normalizeAccentColor(value) {
    const raw = String(value || "").trim();
    if (!raw) return DEFAULT_ACCENT_COLOR;
    const normalized = raw.startsWith("#") ? raw : `#${raw}`;
    const shortHexMatch = /^#([0-9a-f]{3})$/i.exec(normalized);
    if (shortHexMatch) {
        const expanded = shortHexMatch[1].split("").map((char) => char + char).join("");
        return `#${expanded}`.toLowerCase();
    }
    if (/^#([0-9a-f]{6})$/i.test(normalized)) {
        return normalized.toLowerCase();
    }
    return DEFAULT_ACCENT_COLOR;
}

function normalizeCompanyNameColor(value) {
    const raw = String(value || "").trim();
    if (!raw) return DEFAULT_COMPANY_NAME_COLOR;
    const normalized = raw.startsWith("#") ? raw : `#${raw}`;
    const shortHexMatch = /^#([0-9a-f]{3})$/i.exec(normalized);
    if (shortHexMatch) {
        const expanded = shortHexMatch[1].split("").map((char) => char + char).join("");
        return `#${expanded}`.toLowerCase();
    }
    if (/^#([0-9a-f]{6})$/i.test(normalized)) {
        return normalized.toLowerCase();
    }
    return DEFAULT_COMPANY_NAME_COLOR;
}

function normalizeThemeMode(value) {
    const raw = String(value || "").trim().toLowerCase();
    if (raw === "light" || raw === "dark" || raw === "auto") {
        return raw;
    }
    return DEFAULT_THEME_MODE;
}

function normalizeIconLibrary(value) {
    return String(value || "").trim().toLowerCase() === "lucide" ? "lucide" : DEFAULT_ICON_LIBRARY;
}

function normalizeHeroBackgroundIcon(value) {
    const normalized = String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
    return normalized || DEFAULT_HERO_BACKGROUND_ICON;
}

function normalizeHexColor(value, fallback) {
    const raw = String(value || "").trim();
    if (!raw) return fallback;
    const normalized = raw.startsWith("#") ? raw : `#${raw}`;
    if (/^#([0-9a-f]{3})$/i.test(normalized)) {
        return `#${normalized.slice(1).split("").map((char) => char + char).join("")}`.toUpperCase();
    }
    if (/^#([0-9a-f]{6})$/i.test(normalized)) {
        return normalized.toUpperCase();
    }
    return fallback;
}

function normalizeNumberInRange(value, fallback, min, max) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.min(Math.max(parsed, min), max);
}

function normalizeDatabaseUrl(value) {
    return String(value || "").trim().replace(/\/+$/, "");
}

export function parseWebConfigJson(rawText) {
    try {
        return JSON.parse(sanitizePastedJsonText(rawText));
    } catch (error) {
        throw makeError("invalid_json", "Invalid JSON. Please paste a valid DoneYetWebConfig JSON bundle.");
    }
}

export function validateWebConfig(inputConfig) {
    if (!inputConfig || typeof inputConfig !== "object" || Array.isArray(inputConfig)) {
        throw makeError("invalid_json", "Invalid JSON. The config bundle must be a JSON object.");
    }

    if (inputConfig.type !== "DoneYetWebConfig") {
        throw makeError("wrong_type", "Wrong config type. Expected type \"DoneYetWebConfig\".");
    }

    if (Number(inputConfig.version) !== 1) {
        throw makeError("unsupported_version", "Unsupported config version. Only version 1 is supported.");
    }

    const connection = inputConfig.connection && typeof inputConfig.connection === "object" ? inputConfig.connection : {};
    const branding = inputConfig.branding && typeof inputConfig.branding === "object" ? inputConfig.branding : {};
    const databaseURL = normalizeDatabaseUrl(connection.databaseURL);
    const companyName = String(branding.companyName || "").trim();

    if (!databaseURL) {
        throw makeError("missing_database_url", "Missing databaseURL. Provide connection.databaseURL in the config bundle.");
    }

    if (!companyName) {
        throw makeError("missing_company_name", "Missing companyName. Provide branding.companyName in the config bundle.");
    }

    const normalized = clonePlainObject(inputConfig);
    normalized.type = "DoneYetWebConfig";
    normalized.version = 1;
    normalized.connection = {
        ...connection,
        databaseURL,
    };
    const brandingWithoutAccent = { ...branding };
    delete brandingWithoutAccent.accentColor;
    normalized.branding = {
        ...brandingWithoutAccent,
        companyName,
        companyNameColor: normalizeCompanyNameColor(branding.companyNameColor),
        themeMode: normalizeThemeMode(branding.themeMode),
        headerTitle: String(branding.headerTitle || "").trim() || FIXED_BRAND_LABEL,
        iconLibrary: normalizeIconLibrary(branding.iconLibrary),
        heroBackgroundIcon: normalizeHeroBackgroundIcon(branding.heroBackgroundIcon),
        heroIconColor: normalizeHexColor(branding.heroIconColor, DEFAULT_HERO_ICON_COLOR),
        heroIconOpacity: normalizeNumberInRange(branding.heroIconOpacity, DEFAULT_HERO_ICON_OPACITY, 0.02, 0.3),
        heroIconScale: normalizeNumberInRange(branding.heroIconScale, DEFAULT_HERO_ICON_SCALE, 0.8, 1.4),
        heroIconHoverScale: normalizeNumberInRange(branding.heroIconHoverScale, DEFAULT_HERO_ICON_HOVER_SCALE, 1.0, 1.2),
    };
    return normalized;
}

export function parseAndValidateWebConfig(rawText) {
    return validateWebConfig(parseWebConfigJson(rawText));
}

export function serializeWebConfig(config) {
    return JSON.stringify(validateWebConfig(config), null, 2);
}

export function readStoredWebConfig() {
    let rawText = null;
    try {
        rawText = window.localStorage.getItem(STORAGE_KEY);
    } catch (error) {
        throw makeError("storage_read_failed", "Could not read saved config from browser storage.");
    }
    if (!rawText) {
        return null;
    }
    return parseAndValidateWebConfig(rawText);
}

export function saveStoredWebConfig(config) {
    const validated = validateWebConfig(config);
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(validated));
    } catch (error) {
        throw makeError("storage_write_failed", "Could not save config to browser storage.");
    }
    return validated;
}

export function forgetStoredWebConfig() {
    try {
        window.localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        throw makeError("storage_write_failed", "Could not remove the saved config from browser storage.");
    }
}

function hexToRgb(hex) {
    const normalized = normalizeAccentColor(hex).replace("#", "");
    return {
        r: parseInt(normalized.slice(0, 2), 16),
        g: parseInt(normalized.slice(2, 4), 16),
        b: parseInt(normalized.slice(4, 6), 16),
    };
}

function withAlpha(hex, alpha) {
    const rgb = hexToRgb(hex);
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

function resolveThemeMode(themeMode) {
    if (themeMode !== "auto") {
        return normalizeThemeMode(themeMode);
    }
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function applyBranding(config, runtimeMetadata = {}) {
    const validated = validateWebConfig(config);
    const branding = validated.branding || {};
    const accentColor = DEFAULT_ACCENT_COLOR;
    const companyNameColor = normalizeCompanyNameColor(branding.companyNameColor);
    const requestedTheme = normalizeThemeMode(branding.themeMode);
    const resolvedTheme = resolveThemeMode(requestedTheme);
    const productName = String((runtimeMetadata && runtimeMetadata.product_name) || "DoneYet / JDTool for Houdini").trim();
    const buildId = String((runtimeMetadata && runtimeMetadata.build_id) || "").trim();

    document.documentElement.dataset.themeMode = resolvedTheme;
    document.documentElement.dataset.themePreference = requestedTheme;
    document.documentElement.style.setProperty("--accent", accentColor);
    document.documentElement.style.setProperty("--accent-soft", withAlpha(accentColor, 0.2));
    document.documentElement.style.setProperty("--accent-strong", withAlpha(accentColor, 0.34));
    document.documentElement.style.setProperty("--accent-glow", withAlpha(accentColor, 0.3));
    document.documentElement.style.setProperty("--success", accentColor);
    document.documentElement.style.setProperty("--brand-company-color", companyNameColor);
    document.documentElement.style.setProperty("--hero-icon-color", normalizeHexColor(branding.heroIconColor, DEFAULT_HERO_ICON_COLOR));
    document.documentElement.style.setProperty("--hero-icon-opacity", String(normalizeNumberInRange(branding.heroIconOpacity, DEFAULT_HERO_ICON_OPACITY, 0.02, 0.3)));
    document.documentElement.style.setProperty("--hero-icon-scale", String(normalizeNumberInRange(branding.heroIconScale, DEFAULT_HERO_ICON_SCALE, 0.8, 1.4)));
    document.documentElement.style.setProperty("--hero-icon-hover-scale", String(normalizeNumberInRange(branding.heroIconHoverScale, DEFAULT_HERO_ICON_HOVER_SCALE, 1.0, 1.2)));

    const brandCompanyName = document.getElementById("brandCompanyName");
    const brandHeaderTitle = document.getElementById("brandHeaderTitle");
    const appFooterBrand = document.getElementById("appFooterBrand");
    const appMetaPrimary = document.getElementById("appMetaPrimary");
    const resolvedCompanyName = String(branding.companyName || "").trim();

    if (brandCompanyName) {
        brandCompanyName.textContent = FIXED_BRAND_LABEL;
    }
    if (brandHeaderTitle) {
        brandHeaderTitle.textContent = resolvedCompanyName || "Company Name";
    }
    if (appFooterBrand) {
        appFooterBrand.textContent = "DoneYet";
    }
    if (appMetaPrimary) {
        appMetaPrimary.textContent = buildId ? `${productName} | Build ${buildId}` : productName;
    }

    document.title = resolvedCompanyName || FIXED_BRAND_LABEL;
    return validated;
}
