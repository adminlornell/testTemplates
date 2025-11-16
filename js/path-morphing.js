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
            duration: options.duration || 800,
            pauseBetween: options.pauseBetween || 200,
            colors: options.colors || ['#B22222', '#8B1A1A'],
            scale: options.scale || 17,
            translateX: options.translateX || 10,
            translateY: options.translateY || 10,
            ...options
        };
        
        // Shape paths
        this.paths = [
            "M7 2v11h3v9l7-12h-4l4-8z", // lightning
            "M23 5.5V20c0 2.2-1.8 4-4 4h-7.3c-1.08 0-2.1-.43-2.85-1.19L1 14.83s1.26-1.23 1.3-1.25c.22-.19.49-.29.79-.29.22 0 .42.06.6.16.04.01 4.31 2.46 4.31 2.46V4c0-.83.67-1.5 1.5-1.5S11 3.17 11 4v7h1V1.5c0-.83.67-1.5 1.5-1.5S15 .67 15 1.5V11h1V2.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5V11h1V5.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5z", // hand
            "M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z", // plane
            "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z", // heart
            "M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z", // note
            "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" // star
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

