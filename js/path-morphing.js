/**
 * Path Morphing Animation using Flubber
 * Vanilla JavaScript version for static HTML sites
 */

class PathMorphing {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container with id "${containerId}" not found`);
            return;
        }
        
        // Configuration
        this.options = {
            width: options.width || 400,
            height: options.height || 400,
            duration: options.duration || 1000,
            pauseBetween: options.pauseBetween || 300,
            colors: options.colors || ['#B22222', '#8B1A1A'],
            scale: options.scale || 15,
            translateX: options.translateX || 12,
            translateY: options.translateY || 12,
            ...options
        };
        
        // Real Estate Related Shape Paths
        // All paths are normalized to 24x24 viewBox for consistent morphing
        this.paths = [
            // Building/Office
            "M3 21h18v-2H3v2zm0-4h4v-4H3v4zm6 0h4v-4H9v4zm6 0h4v-4h-4v4zm-12-6h4V7H3v4zm6 0h4V7H9v4zm6 0h4V7h-4v4zm-12-6h18V3H3v2z",
            // Key
            "M17 8c0-2.76-2.24-5-5-5S7 5.24 7 8c0 1.57.73 2.97 1.86 3.89L3 19.17V22h3.83l5.28-5.28c.92 1.13 2.32 1.86 3.89 1.86 2.76 0 5-2.24 5-5s-2.24-5-5-5zm-5 7c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z",
            // Location Pin/Map Marker
            "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
            // Dollar Sign/Money
            "M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z",
            // Growth Chart/Trending Up
            "M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z",
            // Handshake/Deal
            "M9.5 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm5.5 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM12 7.5c2.33 0 4.31 1.46 5.11 3.5h1.3c.8-2.05 2.78-3.5 5.09-3.5 1.74 0 3.26.96 4.05 2.38.26-.51.4-1.07.4-1.65 0-2.22-1.78-4-4-4-1.4 0-2.6.72-3.29 1.8C18.6 3.68 17.37 3 16 3c-1.23 0-2.29.7-2.82 1.71-.53-1.01-1.59-1.71-2.82-1.71-1.37 0-2.6.68-3.29 1.8C6.6 3.72 5.4 3 4 3 1.78 3 0 4.78 0 7c0 .58.14 1.14.4 1.65C1.19 7.46 2.71 6.5 4.45 6.5c2.31 0 4.29 1.45 5.09 3.5h1.3c.8-2.04 2.78-3.5 5.11-3.5zM2 14.5c0 1.38 1.12 2.5 2.5 2.5h15c1.38 0 2.5-1.12 2.5-2.5V12H2v2.5z",
            // Document/Contract
            "M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"
        ];
        
        this.currentPathIndex = 0;
        this.animationId = null;
        this.isAnimating = false;
        
        this.init();
    }
    
    init() {
        // Create SVG element
        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svg.setAttribute('width', this.options.width);
        this.svg.setAttribute('height', this.options.height);
        this.svg.setAttribute('viewBox', `0 0 ${this.options.width} ${this.options.height}`);
        
        // Create group with transform
        this.g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.g.setAttribute('transform', 
            `translate(${this.options.translateX} ${this.options.translateY}) scale(${this.options.scale} ${this.options.scale})`);
        
        // Create path element
        this.pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.pathElement.setAttribute('d', this.paths[0]);
        this.pathElement.setAttribute('fill', this.options.colors[0]);
        
        this.g.appendChild(this.pathElement);
        this.svg.appendChild(this.g);
        this.container.appendChild(this.svg);
        
        // Start animation
        setTimeout(() => this.start(), 500);
    }
    
    easeInOut(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
    
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    
    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
    
    interpolateColor(color1, color2, t) {
        const rgb1 = this.hexToRgb(color1);
        const rgb2 = this.hexToRgb(color2);
        if (!rgb1 || !rgb2) return color1;
        
        const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * t);
        const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * t);
        const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * t);
        return this.rgbToHex(r, g, b);
    }
    
    animatePath(fromPath, toPath, fromColor, toColor) {
        if (this.isAnimating) return;
        this.isAnimating = true;
        
        const startTime = performance.now();
        const interpolator = flubber.interpolate(fromPath, toPath, {
            maxSegmentLength: 0.1
        });
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const t = Math.min(elapsed / this.options.duration, 1);
            const easedT = this.easeInOut(t);
            
            // Interpolate path
            const currentPath = interpolator(easedT);
            this.pathElement.setAttribute('d', currentPath);
            
            // Interpolate color
            const currentColor = this.interpolateColor(fromColor, toColor, easedT);
            this.pathElement.setAttribute('fill', currentColor);
            
            if (t < 1) {
                this.animationId = requestAnimationFrame(animate);
            } else {
                this.isAnimating = false;
                // Move to next path
                this.currentPathIndex = (this.currentPathIndex + 1) % this.paths.length;
                if (this.currentPathIndex === 0) {
                    this.currentPathIndex = 1;
                }
                
                const nextIndex = (this.currentPathIndex + 1) % this.paths.length;
                setTimeout(() => {
                    this.animatePath(
                        this.paths[this.currentPathIndex],
                        this.paths[nextIndex],
                        this.options.colors[this.currentPathIndex % this.options.colors.length],
                        this.options.colors[nextIndex % this.options.colors.length]
                    );
                }, this.options.pauseBetween);
            }
        };
        
        this.animationId = requestAnimationFrame(animate);
    }
    
    start() {
        const nextIndex = (this.currentPathIndex + 1) % this.paths.length;
        this.animatePath(
            this.paths[this.currentPathIndex],
            this.paths[nextIndex],
            this.options.colors[this.currentPathIndex % this.options.colors.length],
            this.options.colors[nextIndex % this.options.colors.length]
        );
    }
    
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.isAnimating = false;
    }
    
    destroy() {
        this.stop();
        if (this.svg && this.svg.parentNode) {
            this.svg.parentNode.removeChild(this.svg);
        }
    }
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.PathMorphing = PathMorphing;
}

