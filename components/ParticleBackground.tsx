import React, { useEffect, useRef, useCallback } from 'react';

interface Point3D {
    x: number;
    y: number;
    z: number;
    baseX: number;
    baseY: number;
    baseZ: number;
    size: number;
}

interface ParticleBackgroundProps {
    particleCount?: number;
    particleColor?: string;
    className?: string;
    radius?: number;
}

export default function ParticleBackground({
    particleCount = 2000,
    particleColor = 'rgba(255, 255, 255, 0.5)',
    className = '',
    radius = 300
}: ParticleBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pointsRef = useRef<Point3D[]>([]);
    const animationRef = useRef<number>();
    const rotationRef = useRef({ x: 0, y: 0 });
    const mouseRef = useRef({ x: 0, y: 0 });
    const centerRef = useRef({ x: 0, y: 0 });

    // Initialize particles in a sphere
    const initParticles = useCallback((width: number, height: number) => {
        const points: Point3D[] = [];
        // Adjust radius based on screen size
        const sphereRadius = Math.min(width, height) * 0.45;

        // Fibonacci Sphere algorithm for even distribution
        const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

        for (let i = 0; i < particleCount; i++) {
            const y = 1 - (i / (particleCount - 1)) * 2; // y goes from 1 to -1
            const radiusAtY = Math.sqrt(1 - y * y); // Radius at y
            const theta = phi * i; // Golden angle increment

            const x = Math.cos(theta) * radiusAtY;
            const z = Math.sin(theta) * radiusAtY;

            // Scale to radius
            points.push({
                x: x * sphereRadius,
                y: y * sphereRadius,
                z: z * sphereRadius,
                baseX: x * sphereRadius,
                baseY: y * sphereRadius,
                baseZ: z * sphereRadius,
                size: Math.random() * 3 + 1.5 // Ukuran lebih besar (1.5 - 4.5px)
            });
        }

        pointsRef.current = points;

        // Initialize center to middle of screen
        centerRef.current = { x: width / 2, y: height / 2 };
        mouseRef.current = { x: width / 2, y: height / 2 };

    }, [particleCount]);

    // Project 3D point to 2D with dynamic center
    const project = (x: number, y: number, z: number, centerX: number, centerY: number) => {
        // Project centered
        const perspective = 800;
        const scale = perspective / (perspective + z);

        return {
            x: centerX + x * scale,
            y: centerY + y * scale,
            scale: scale
        };
    };

    // Animation loop
    const animate = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Smoothly move center towards mouse
        // Easing factor (lower = slower/smoother)
        const moveEase = 0.08;
        centerRef.current.x += (mouseRef.current.x - centerRef.current.x) * moveEase;
        centerRef.current.y += (mouseRef.current.y - centerRef.current.y) * moveEase;

        // Rotation follows mouse direction relative to center
        // Note: Using current centerRef for rotation reference creates a "drag" effect
        const targetRotX = (mouseRef.current.y - height / 2) * 0.001;
        const targetRotY = (mouseRef.current.x - width / 2) * 0.001;

        const rotEase = 0.1;
        rotationRef.current.x += (targetRotX - rotationRef.current.x) * rotEase;
        rotationRef.current.y += (targetRotY - rotationRef.current.y) * rotEase;

        // Constant slow rotation
        const time = Date.now() * 0.0002;
        const waveTime = Date.now() * 0.002; // Faster time for wave

        const finalRotX = rotationRef.current.x;
        const finalRotY = rotationRef.current.y + time;

        const cosX = Math.cos(finalRotX);
        const sinX = Math.sin(finalRotX);
        const cosY = Math.cos(finalRotY);
        const sinY = Math.sin(finalRotY);

        pointsRef.current.forEach((point) => {
            // Rotate around Y
            let x1 = point.baseX * cosY - point.baseZ * sinY;
            let z1 = point.baseZ * cosY + point.baseX * sinY;

            // Rotate around X
            let y1 = point.baseY * cosX - z1 * sinX;
            let z2 = z1 * cosX + point.baseY * sinX;

            // Add Deep Wave Effect 🌊🌊
            // Strongly modulate positions to break the sphere shape
            // Primary low frequency wave
            const wave1 = Math.sin(x1 * 0.008 + waveTime) * 60;
            // Secondary high frequency ripple
            const wave2 = Math.cos(z1 * 0.015 + waveTime * 1.5) * 30;

            // Apply distortion
            y1 += wave1 + wave2;

            // Projection using dynamic center
            const projected = project(x1, y1, z2, centerRef.current.x, centerRef.current.y);

            // Draw
            const alpha = Math.max(0, (projected.scale - 0.4) * 1.5);

            if (alpha > 0) {
                ctx.beginPath();
                const s = point.size * projected.scale;

                // Render as Pill Shape / Rounded Line 💊
                ctx.lineCap = 'round';
                ctx.lineWidth = s * 0.6; // Width relative to size
                ctx.strokeStyle = particleColor;
                ctx.globalAlpha = alpha;

                // Calculate direction/rotation for the particle
                // Align with sphere rotation or fixed angle? 
                // Reference image shows diagonal. Let's make them rotate slightly with the sphere movement
                // giving a dynamic "confetti" feel

                const angle = Math.atan2(y1, x1) + Math.PI / 2; // Tangent to circle roughly
                const len = s * 2; // Length of the pill

                const dx = Math.cos(angle) * len;
                const dy = Math.sin(angle) * len;

                ctx.moveTo(projected.x - dx / 2, projected.y - dy / 2);
                ctx.lineTo(projected.x + dx / 2, projected.y + dy / 2);
                ctx.stroke();
            }
        });

        animationRef.current = requestAnimationFrame(animate);
    }, [particleColor]);

    const handleResize = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        initParticles(rect.width, rect.height);
    }, [initParticles]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        mouseRef.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    }, []);

    useEffect(() => {
        handleResize();
        animate();

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [handleResize, handleMouseMove, animate]);

    return (
        <canvas
            ref={canvasRef}
            className={`absolute inset-0 pointer-events-none ${className}`}
            style={{ width: '100%', height: '100%' }}
        />
    );
}
