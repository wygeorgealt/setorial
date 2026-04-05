const fs = require('fs');
const path = require('path');

const targetDirs = [
    path.join(__dirname, 'app'),
    path.join(__dirname, 'components')
];

// We use capture groups to ensure we only match standalone classes that are not already dark: prefixed
// $1 matches the preceding character (space, quote, backtick)
const mappings = [
    { find: 'bg-white', replace: 'bg-white dark:bg-zinc-950' },
    { find: 'bg-gray-50', replace: 'bg-gray-50 dark:bg-zinc-900' },
    { find: 'bg-gray-100', replace: 'bg-gray-100 dark:bg-zinc-800' },
    { find: 'bg-gray-200', replace: 'bg-gray-200 dark:bg-zinc-800/80' },
    { find: 'text-black', replace: 'text-black dark:text-white' },
    { find: 'text-gray-900', replace: 'text-gray-900 dark:text-gray-100' },
    { find: 'text-gray-800', replace: 'text-gray-800 dark:text-gray-200' },
    { find: 'text-gray-700', replace: 'text-gray-700 dark:text-gray-300' },
    { find: 'text-gray-600', replace: 'text-gray-600 dark:text-gray-400' },
    { find: 'text-gray-500', replace: 'text-gray-500 dark:text-gray-400' },
    { find: 'border-gray-100', replace: 'border-gray-100 dark:border-zinc-800' },
    { find: 'border-gray-200', replace: 'border-gray-200 dark:border-zinc-800' },
    { find: 'border-gray-300', replace: 'border-gray-300 dark:border-zinc-700' },
    { find: 'bg-white/90', replace: 'bg-white/90 dark:bg-zinc-950/90' },
    { find: 'bg-white/80', replace: 'bg-white/80 dark:bg-zinc-900/80' },
];

function processDirectory(directory) {
    if (!fs.existsSync(directory)) return;
    const files = fs.readdirSync(directory);
    for (const file of files) {
        const fullPath = path.join(directory, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.tsx')) {
            processFile(fullPath);
        }
    }
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    for (const map of mappings) {
        // Build regex to match: 
        // 1. Preceded by start of string, whitespace, quote, or backtick
        // 2. The exact class name
        // 3. Followed by end of string, whitespace, quote, or backtick
        // 4. NOT followed by anything indicating it's already got a dark: equivalent directly after it
        const escapedFind = map.find.replace(/\//g, '\\/');
        const regex = new RegExp(`(^|[\\s'"\`])(${escapedFind})(?![\\w\\-])`, 'g');
        
        let newContent = content;
        let isReplaced = false;

        newContent = newContent.replace(regex, (match, prefix, className, offset, fullString) => {
            // Check if there's already a dark version in the immediate vicinity 
            // string context (heuristics avoid replacing if 'dark:bg-zinc' exists a few chars ahead)
            const forwardLook = fullString.substring(offset, offset + 40);
            if (forwardLook.includes('dark:')) {
                return match; // skip, already supports dark mode
            }
            
            // Check backwards to ensure we didn't match something that is already prefixed like pseudo-classes (e.g. active:bg-white)
            // If the prefix is a colon, it's something like hover:bg-white. We skip pseudo states to avoid complexity
            const backwardLook = fullString.substring(Math.max(0, offset - 10), offset);
            if (backwardLook.match(/[a-z]+:$/)) {
                return match; 
            }

            return prefix + map.replace;
        });

        content = newContent;
    }

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${path.relative(__dirname, filePath)}`);
    }
}

for (const dir of targetDirs) {
    processDirectory(dir);
}
console.log('Dark mode classes injected successfully.');
