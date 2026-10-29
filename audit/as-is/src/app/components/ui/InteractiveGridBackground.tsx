import React, { useEffect, useRef, useState } from 'react';

export interface InteractiveGridBackgroundProps {
  /** Optional ref to parent element. If omitted, attaches to canvas parentElement. */
  parentRef?: React.RefObject<HTMLElement | null>;
  /** Theme override: 'dark', 'light', or 'auto' (detects html.dark class & reacts to theme-change). Default: 'auto' */
  theme?: 'dark' | 'light' | 'auto';
  /** Additional CSS classes for canvas. Default: 'absolute inset-0 pointer-events-none z-0' */
  className?: string;
  /** Positioning mode: 'absolute' (default) or 'fixed' (pins canvas to parent's visible viewport rect) */
  positionMode?: 'absolute' | 'fixed';
  /** Spacing between grid dots in pixels. Default: 28 */
  spacing?: number;
  /** Radius of magnetic mouse influence in pixels. Default: 160 */
  hoverRadius?: number;
  /** Spring return physics constant. Default: 0.08 */
  springConstant?: number;
  /** Velocity damping factor. Default: 0.82 */
  damping?: number;
  /** Pull strength towards cursor (0 - 1). Default: 0.18 */
  pullStrength?: number;
  /** Base opacity of unhovered dots. Default: 0.04 */
  baseAlpha?: number;
  /** Max glow opacity when hovered. Default: 0.55 */
  maxGlowAlpha?: number;
  /** Max dot radius when hovered. Default: 3.4 */
  maxDotRadius?: number;
  /** Base dot radius. Default: 1.2 */
  baseDotRadius?: number;
  /** Accent RGB color when glowing. Default: NVUTO Magnetic Flare { r: 255, g: 87, b: 23 } (#FF5717) */
  accentRGB?: { r: number; g: number; b: number };
}

export const InteractiveGridBackground: React.FC<InteractiveGridBackgroundProps> = ({
  parentRef,
  theme = 'auto',
  className = 'absolute inset-0 pointer-events-none z-0',
  positionMode = 'absolute',
  spacing = 28,
  hoverRadius = 160,
  springConstant = 0.08,
  damping = 0.82,
  pullStrength = 0.18,
  baseAlpha = 0.04,
  maxGlowAlpha = 0.55,
  maxDotRadius = 3.4,
  baseDotRadius = 1.2,
  accentRGB = { r: 255, g: 87, b: 23 },
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<{ mouseX: number; mouseY: number; isHovered: boolean }>({
    mouseX: -9999,
    mouseY: -9999,
    isHovered: false,
  });

  // Track active resolved theme ('dark' or 'light')
  const [activeTheme, setActiveTheme] = useState<'dark' | 'light'>(() => {
    if (theme === 'dark' || theme === 'light') return theme;
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    return 'dark';
  });

  // React to theme changes when theme === 'auto'
  useEffect(() => {
    if (theme === 'dark' || theme === 'light') {
      setActiveTheme(theme);
      return;
    }

    const resolveTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setActiveTheme(isDark ? 'dark' : 'light');
    };

    resolveTheme();

    // Listen to theme-change event from GlobalHeader
    window.addEventListener('theme-change', resolveTheme);

    // Also observe html class attribute mutations for dark mode toggles
    const mutationObserver = new MutationObserver(() => {
      resolveTheme();
    });
    mutationObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      window.removeEventListener('theme-change', resolveTheme);
      mutationObserver.disconnect();
    };
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = parentRef?.current || canvas.parentElement;
    if (!parent) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let dots: Array<{
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
    }> = [];

    const isDark = activeTheme === 'dark';

    // Setup canvas size and dot positions
    const setupCanvas = () => {
      const rect = parent.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      if (positionMode === 'fixed') {
        canvas.style.position = 'fixed';
        canvas.style.left = `${rect.left}px`;
        canvas.style.top = `${rect.top}px`;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const isMobile = window.innerWidth < 768;
      const cols = Math.ceil(rect.width / spacing) + 1;
      const rows = Math.ceil(rect.height / spacing) + 1;

      // On mobile viewports (< 768px), draw dots statically in a single pass to preserve battery & GPU
      if (isMobile) {
        ctx.clearRect(0, 0, rect.width, rect.height);
        ctx.fillStyle = isDark
          ? `rgba(255, 255, 255, ${baseAlpha})`
          : `rgba(15, 20, 23, ${baseAlpha})`;

        for (let c = 0; c < cols; c++) {
          for (let r = 0; r < rows; r++) {
            const x = c * spacing;
            const y = r * spacing;
            ctx.beginPath();
            ctx.arc(x, y, baseDotRadius, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        return;
      }

      // Generate desktop interactive dot coordinates
      dots = [];
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const baseX = c * spacing;
          const baseY = r * spacing;
          dots.push({
            x: baseX,
            y: baseY,
            baseX,
            baseY,
            vx: 0,
            vy: 0,
            radius: baseDotRadius,
            alpha: baseAlpha,
          });
        }
      }
    };

    setupCanvas();

    window.addEventListener('resize', setupCanvas);

    const resizeObserver = new ResizeObserver(() => {
      setupCanvas();
    });
    resizeObserver.observe(parent);

    // Mouse movement listener on target parent
    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 768) return;
      const rect = parent.getBoundingClientRect();
      contextRef.current.mouseX = e.clientX - rect.left;
      contextRef.current.mouseY = e.clientY - rect.top;
      contextRef.current.isHovered = true;
    };

    const handleMouseEnter = () => {
      if (window.innerWidth < 768) return;
      contextRef.current.isHovered = true;
    };

    const handleMouseLeave = () => {
      if (window.innerWidth < 768) return;
      contextRef.current.isHovered = false;
    };

    parent.addEventListener('mousemove', handleMouseMove);
    parent.addEventListener('mouseenter', handleMouseEnter);
    parent.addEventListener('mouseleave', handleMouseLeave);

    // Tab visibility check to pause animation loop when backgrounded
    let isTabVisible = document.visibilityState === 'visible';
    const handleVisibilityChange = () => {
      isTabVisible = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Viewport intersection check to pause animation when scrolled out of view
    let isIntersecting = true;
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isIntersecting = entry.isIntersecting;
        });
      },
      { threshold: 0.01 }
    );
    intersectionObserver.observe(parent);

    // Animation Loop
    const draw = () => {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        // Idle loop without physics calculations on mobile
        animationFrameId = requestAnimationFrame(draw);
        return;
      }

      if (!isTabVisible || !isIntersecting) {
        animationFrameId = requestAnimationFrame(draw);
        return;
      }

      const rect = parent.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      const { mouseX, mouseY, isHovered } = contextRef.current;

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];

        // Distance to original resting position
        const dx = mouseX - dot.baseX;
        const dy = mouseY - dot.baseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let targetX = dot.baseX;
        let targetY = dot.baseY;
        let targetRadius = baseDotRadius;
        let targetAlpha = baseAlpha;
        let targetColor: string;

        if (isHovered && dist < hoverRadius) {
          const factor = 1 - dist / hoverRadius; // 1 at cursor, 0 at outer edge

          // Magnetic pull towards cursor
          targetX = dot.baseX + dx * factor * pullStrength;
          targetY = dot.baseY + dy * factor * pullStrength;

          // Glow growth
          targetRadius = baseDotRadius + factor * (maxDotRadius - baseDotRadius);
          targetAlpha = baseAlpha + factor * (maxGlowAlpha - baseAlpha);

          if (!isDark) {
            // Light mode: Interpolate from slate dark RGB(15, 20, 23) to accent RGB
            const r = Math.round(accentRGB.r * factor + 15 * (1 - factor));
            const g = Math.round(accentRGB.g * factor + 20 * (1 - factor));
            const b = Math.round(accentRGB.b * factor + 23 * (1 - factor));
            targetColor = `rgba(${r}, ${g}, ${b}, ${targetAlpha})`;
          } else {
            // Dark mode: Interpolate from white/light-gray to accent RGB
            const r = Math.round(accentRGB.r * factor + 255 * (1 - factor));
            const g = Math.round(accentRGB.g * factor + 255 * (1 - factor));
            const b = Math.round(accentRGB.b * factor + 255 * (1 - factor));
            targetColor = `rgba(${r}, ${g}, ${b}, ${targetAlpha})`;
          }
        } else {
          targetColor = isDark
            ? `rgba(255, 255, 255, ${dot.alpha})`
            : `rgba(15, 20, 23, ${dot.alpha})`;
        }

        // Spring physics equation
        const ax = (targetX - dot.x) * springConstant;
        const ay = (targetY - dot.y) * springConstant;

        dot.vx = (dot.vx + ax) * damping;
        dot.vy = (dot.vy + ay) * damping;

        dot.x += dot.vx;
        dot.y += dot.vy;

        // Smooth visual transitions
        dot.radius += (targetRadius - dot.radius) * 0.2;
        dot.alpha += (targetAlpha - dot.alpha) * 0.2;

        // Render dot
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fillStyle = targetColor;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', setupCanvas);
      parent.removeEventListener('mousemove', handleMouseMove);
      parent.removeEventListener('mouseenter', handleMouseEnter);
      parent.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    parentRef,
    activeTheme,
    spacing,
    hoverRadius,
    springConstant,
    damping,
    pullStrength,
    baseAlpha,
    maxGlowAlpha,
    maxDotRadius,
    baseDotRadius,
    accentRGB,
    positionMode,
  ]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
};
export default InteractiveGridBackground;
