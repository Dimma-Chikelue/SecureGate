const fs = require('fs');
const path = require('path');

// Read files
const colorTokensPath = path.join(__dirname, 'color-tokens.js');
const designTokensPath = path.join(__dirname, 'design-tokens.tokens.json');

const colorTokensRaw = fs.readFileSync(colorTokensPath, 'utf8');
const colorTokens = JSON.parse(colorTokensRaw);

const designTokensRaw = fs.readFileSync(designTokensPath, 'utf8');
const designTokens = JSON.parse(designTokensRaw);

let cssContent = `/* Auto-generated CSS variables from design tokens */\n\n`;

// Helper to resolve color references
function resolveColor(ref, tokens) {
    if (typeof ref === 'string' && ref.startsWith('{') && ref.endsWith('}')) {
        const path = ref.slice(1, -1).split('.');
        let current = tokens;
        for (const key of path) {
            if (current && current[key] !== undefined) {
                current = current[key];
            } else {
                return ref; // unresolvable
            }
        }
        return current;
    }
    return ref;
}

// 1. Process Color Tokens (only roles)
cssContent += `:root {\n`;
cssContent += `  /* Light Theme Color Roles */\n`;
if (colorTokens.color && colorTokens.color.role && colorTokens.color.role.light) {
    const lightRoles = colorTokens.color.role.light;
    for (const [key, value] of Object.entries(lightRoles)) {
        const resolvedValue = resolveColor(value, colorTokens);
        // Convert camelCase to kebab-case
        const cssVarName = key.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
        cssContent += `  --color-${cssVarName}: ${resolvedValue};\n`;
    }
}
cssContent += `}\n\n`;

// Dark mode via media query and class
cssContent += `@media (prefers-color-scheme: dark) {\n`;
cssContent += `  :root {\n`;
cssContent += `    /* Dark Theme Color Roles */\n`;
if (colorTokens.color && colorTokens.color.role && colorTokens.color.role.dark) {
    const darkRoles = colorTokens.color.role.dark;
    for (const [key, value] of Object.entries(darkRoles)) {
        const resolvedValue = resolveColor(value, colorTokens);
        const cssVarName = key.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
        cssContent += `    --color-${cssVarName}: ${resolvedValue};\n`;
    }
}
cssContent += `  }\n`;
cssContent += `}\n\n`;

// Also add a .dark class for manual toggling
cssContent += `.dark {\n`;
cssContent += `  /* Dark Theme Color Roles (Manual Toggle) */\n`;
if (colorTokens.color && colorTokens.color.role && colorTokens.color.role.dark) {
    const darkRoles = colorTokens.color.role.dark;
    for (const [key, value] of Object.entries(darkRoles)) {
        const resolvedValue = resolveColor(value, colorTokens);
        const cssVarName = key.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
        cssContent += `  --color-${cssVarName}: ${resolvedValue};\n`;
    }
}
cssContent += `}\n\n`;

// 2. Process Typography Tokens
cssContent += `:root {\n`;
cssContent += `  /* Typography Tokens */\n`;

function formatCssVarName(str) {
    return str
        .replace(/my coco pie.*?typography/gi, '')
        .replace(/[^a-zA-Z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase();
}

function extractTypography(obj, prefix = '') {
    let vars = '';
    for (const [key, value] of Object.entries(obj)) {
        const newPrefix = prefix ? `${prefix}-${key}` : key;
        
        if (value && typeof value === 'object') {
            if (value.value !== undefined) {
                // Leaf node
                let finalVal = value.value;
                const cleanKey = formatCssVarName(newPrefix);
                
                // Add px to dimensions if needed
                if ((value.type === 'dimension' || key.toLowerCase().includes('size') || key.toLowerCase().includes('height') || key.toLowerCase().includes('spacing') || key.toLowerCase().includes('indent')) && typeof finalVal === 'number' && finalVal !== 0) {
                    finalVal = finalVal + 'px';
                }
                
                // Exclude some raw figma extensions or non-css properties if they leak, but typically it's fine.
                if(cleanKey && finalVal !== undefined) {
                    vars += `  --typography-${cleanKey}: ${finalVal};\n`;
                }
            } else {
                // Not a leaf node, recursively extract unless it's extensions
                if (key !== 'extensions') {
                    vars += extractTypography(value, newPrefix);
                }
            }
        }
    }
    return vars;
}

if (designTokens.typography) {
    cssContent += extractTypography(designTokens.typography);
} else if (designTokens.font) {
    cssContent += extractTypography(designTokens.font);
}

cssContent += `}\n`;

const outputPath = path.join(__dirname, 'variables.css');
fs.writeFileSync(outputPath, cssContent);
console.log('Successfully generated variables.css');
