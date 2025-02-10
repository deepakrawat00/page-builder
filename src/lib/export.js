import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export async function exportToZip(components) {
    const zip = new JSZip();
    const imagesFolder = zip.folder("images");
    const processedComponents = await processImages(components, imagesFolder);

    // Generate HTML
    const html = generateHTML(processedComponents);
    zip.file("index.html", html);

    // Generate CSS
    const css = generateCSS(processedComponents);
    zip.file("styles.css", css);

    // Generate JS
    const js = generateJS();
    zip.file("script.js", js);

    // Create and download zip
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "landing-page.zip");
}

async function processImages(components, imagesFolder) {
    const processedComponents = [];
    let imageCounter = 1;

    for (const component of components) {
        if (component.type === 'image') {
            const imageContent = component.content;
            let newImagePath;

            if (imageContent.startsWith('data:image')) {
                // Handle base64 images
                const imageData = imageContent.split(',')[1];
                const imageExtension = imageContent.split(';')[0].split('/')[1];
                const fileName = `image-${imageCounter}.${imageExtension}`;
                await imagesFolder.file(fileName, imageData, { base64: true });
                newImagePath = `images/${fileName}`;
                imageCounter++;
            } else if (imageContent.startsWith('http')) {
                // Handle external URLs
                try {
                    const response = await fetch(imageContent);
                    const blob = await response.blob();
                    const imageExtension = blob.type.split('/')[1];
                    const fileName = `image-${imageCounter}.${imageExtension}`;
                    const arrayBuffer = await blob.arrayBuffer();
                    await imagesFolder.file(fileName, arrayBuffer);
                    newImagePath = `images/${fileName}`;
                    imageCounter++;
                } catch (error) {
                    console.error('Error downloading image:', error);
                    newImagePath = imageContent; // Fallback to original URL if download fails
                }
            } else {
                newImagePath = imageContent;
            }

            processedComponents.push({
                ...component,
                content: newImagePath
            });
        } else {
            processedComponents.push(component);
        }
    }

    return processedComponents;
}

function componentToHTML(component, index) {
    // Convert style object to string, handling all possible style properties
    const styleString = component.style ?
        Object.entries(component.style)
            .map(([key, value]) => {
                // Convert camelCase to kebab-case for CSS properties
                const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
                return `${cssKey}: ${value}`;
            })
            .filter(style => style) // Remove any empty styles
            .join('; ') : '';

    switch (component.type) {
        case 'heading':
            return `<h2 class="heading heading-${index}" style="${styleString}">${component.content}</h2>`;
        case 'paragraph':
            return `<p class="paragraph paragraph-${index}" style="${styleString}">${component.content}</p>`;
        case 'button':
            return `<button class="button button-${index}" style="${styleString}">${component.content}</button>`;
        case 'image':
            return `<img src="${component.content}" alt="Image ${index + 1}" class="image image-${index}" style="${styleString}">`;
        default:
            return '';
    }
}

function generateHTML(components) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Landing Page</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        ${components.map((component, index) => componentToHTML(component, index)).join('\n        ')}
    </div>
    <script src="script.js"></script>
</body>
</html>
    `;
}

function generateCSS(components) {
    // Base styles
    const baseStyles = `
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

.heading {
    margin-bottom: 1rem;
    font-weight: bold;
}

.paragraph {
    line-height: 1.6;
    margin-bottom: 1rem;
}

.button {
    cursor: pointer;
    transition: opacity 0.2s;
    display: inline-block;
}

.button:hover {
    opacity: 0.9;
}

.image {
    max-width: 100%;
    height: auto;
    margin-bottom: 1rem;
    display: block;
}
    `;

    // Generate component-specific styles
    const componentStyles = components.map((component, index) => {
        const className = `${component.type}-${index}`;
        const defaultStyles = getDefaultStyles(component.type);
        const customStyles = component.style ?
            Object.entries(component.style)
                .map(([key, value]) => {
                    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
                    return `    ${cssKey}: ${value};`;
                })
                .join('\n') : '';

        return `.${className} {
${defaultStyles}
${customStyles}
}`;
    }).join('\n\n');

    return baseStyles + '\n\n' + componentStyles;
}

function getDefaultStyles(type) {
    switch (type) {
        case 'heading':
            return `    font-size: 2rem;
    font-weight: bold;
    color: inherit;
    margin-bottom: 1rem;`;

        case 'paragraph':
            return `    font-size: 1rem;
    line-height: 1.6;
    margin-bottom: 1rem;`;

        case 'button':
            return `    padding: 0.5rem 1rem;
    border: none;
    border-radius: 0.25rem;
    background-color: #0070f3;
    color: white;
    cursor: pointer;
    transition: opacity 0.2s;`;

        case 'image':
            return `    display: block;
    max-width: 100%;
    height: auto;
    margin-bottom: 1rem;`;

        default:
            return '';
    }
}

function generateJS() {
    return `
// Add interactivity
document.addEventListener('DOMContentLoaded', function() {
    // Button click handlers
    const buttons = document.querySelectorAll('.button');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            console.log('Button clicked:', e.target.textContent);
        });
    });

    // Image loading error handler
    const images = document.querySelectorAll('.image');
    images.forEach(img => {
        img.addEventListener('error', function() {
            this.src = 'https://docs.commercetools.com/frontend-studio/static/f01928f2c694c4f3372daf8bdb8d3c28/8201f/empty-page-builder-overview-new.png';
        });
    });
});
    `;
} 