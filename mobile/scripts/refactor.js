const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const dirsToScan = ['app', 'components'];

function processFile(filePath) {
    if (filePath.endsWith('SoundButton.tsx')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes('<TouchableOpacity')) return;

    // 1. Replace <TouchableOpacity with <SoundButton
    content = content.replace(/<TouchableOpacity([\s\S]*?)>/g, (match, p1) => {
        // Basic heuristic for soundType based on what is passed to onPress
        let soundType = 'tap';
        if (p1.includes('router.back()') || p1.includes('setShow') || p1.includes('Close')) soundType = 'boop';
        
        if (soundType !== 'tap') {
            return `<SoundButton soundType="${soundType}"${p1}>`;
        }
        return `<SoundButton${p1}>`;
    });
    
    content = content.replace(/<\/TouchableOpacity>/g, '</SoundButton>');

    // 2. Add import
    // Depth from rootDir
    // If filePath is c:\Users\kritex\setorial\mobile\app\index.tsx
    // Relative is app\index.tsx -> 1 folder deep -> depth 1 -> '../'
    const relPath = path.relative(path.join(rootDir, 'dummy'), filePath);
    // actually, let's just find the depth of the directory
    const dirDepth = path.relative(rootDir, path.dirname(filePath)).split(path.sep).length;
    let upward = '../'.repeat(dirDepth);
    if (upward === '') upward = './';
    
    const importPath = `${upward}components/SoundButton`.replace(/\\/g, '/');
    
    if (!content.includes('import { SoundButton }')) {
        // Insert right after the React Native imports usually
        content = `import { SoundButton } from '${importPath}';\n` + content;
    }

    fs.writeFileSync(filePath, content);
    console.log('Modified', path.relative(rootDir, filePath));
}

function walkList(dir) {
    const list = fs.readdirSync(dir);
    for (const item of list) {
        const full = path.join(dir, item);
        if (fs.statSync(full).isDirectory()) {
            walkList(full);
        } else if (full.endsWith('.tsx') || full.endsWith('.ts')) {
            processFile(full);
        }
    }
}

dirsToScan.forEach(d => walkList(path.join(rootDir, d)));
console.log("Refactoring complete");
