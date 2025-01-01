const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const altConfigs = {};

// project/theme/minos/scripts => project
const hexoRoot = path.join(__dirname, '..', '..', '..')
// project/theme/minos/scripts => project/theme/minos
const themeRoot = path.join(__dirname, '..');

function getThemeName() {
    const themeDir = hexo.theme_dir; // Absolute path to the current theme directory
    const themeName = themeDir.split('/').filter(Boolean).pop(); // Extract the theme name
    return themeName;
}

/**
 * Theme configuration helper.
 */
function getConfig(config, path) {
    const paths = path.split('.');
    for (let path of paths) {
        if (typeof (config) === 'undefined' || config === null || !config.hasOwnProperty(path)) {
            return null;
        }
        config = config[path];
    }
    return config;
}

/**
 * Get alternative theme config file by page language
 *
 * @param lang page language
 * @returns Object merged theme config
 */
function getThemeConfig(lang = null) {
    if (lang) {
        if (!altConfigs.hasOwnProperty(lang)) {
            let configPath = path.join(hexoRoot, '_config.' + getThemeName() + '.' + lang + '.yml');
            if (!fs.existsSync(configPath)) {
                configPath = path.join(themeRoot, '_config.' + lang + '.yml');
            }
            if (fs.existsSync(configPath)) {
                const config = yaml.load(fs.readFileSync(configPath));
                if (config != null) {
                    altConfigs[lang] = config;
                }
            }
        }
        if (altConfigs.hasOwnProperty(lang) && altConfigs[lang]) {
            return Object.assign({}, hexo.theme.config, altConfigs[lang]);
        }
    }
    return hexo.theme.config;
}

hexo.extend.helper.register('has_config', function (configName, excludePage = false) {
    return getConfig(Object.assign({},
        this.config,
        getThemeConfig(this.page.lang),
        !excludePage ? this.page : {}), configName) !== null;
});

hexo.extend.helper.register('get_config', function (configName, defaultValue = null, excludePage = false) {
    let config = getConfig(Object.assign({},
        this.config,
        getThemeConfig(this.page.lang),
        !excludePage ? this.page : {}), configName);
    return config === null ? defaultValue : config;
});