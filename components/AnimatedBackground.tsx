
import React, { useRef, useEffect } from 'react';

const AnimatedBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    
    const mouse = {
      x: null as number | null,
      y: null as number | null,
      radius: 150
    };

    const handleMouseMove = (event: MouseEvent) => {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
    };
    
    window.addEventListener('mousemove', handleMouseMove);

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      x: number;
      y: number;
      directionX: number;
      directionY: number;
      size: number;
      color: string;

      constructor(x: number, y: number, directionX: number, directionY: number, size: number, color: string) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
        this.color = color;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
      }

      update() {
        if (this.x > canvas.width || this.x < 0) {
          this.directionX = -this.directionX;
        }
        if (this.y > canvas.height || this.y < 0) {
          this.directionY = -this.directionY;
        }

        // check mouse collision
        if(mouse.x && mouse.y) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < mouse.radius + this.size) {
                if (mouse.x < this.x && this.x < canvas.width - this.size * 10) {
                    this.x += 5;
                }
                if (mouse.x > this.x && this.x > this.size * 10) {
                    this.x -= 5;
                }
                if (mouse.y < this.y && this.y < canvas.height - this.size * 10) {
                    this.y += 5;
                }
                if (mouse.y > this.y && this.y > this.size * 10) {
                    this.y -= 5;
                }
            }
        }
        this.x += this.directionX;
        this.y += this.directionY;
        this.draw();
      }
    }

    const init = () => {
      particles = [];
      const numberOfParticles = (canvas.height * canvas.width) / 9000;
      for (let i = 0; i < numberOfParticles; i++) {
        const size = Math.random() * 2 + 1;
        const x = Math.random() * (window.innerWidth - size * 2) + size;
        const y = Math.random() * (window.innerHeight - size * 2) + size;
        const directionX = (Math.random() * 0.4) - 0.2;
        const directionY = (Math.random() * 0.4) - 0.2;
        const color = 'rgba(168, 85, 247, 0.8)'; // purple-500
        particles.push(new Particle(x, y, directionX, directionY, size, color));
      }
    };

    const connect = () => {
      let opacityValue = 1;
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          const distance = ((particles[a].x - particles[b].x) * (particles[a].x - particles[b].x))
            + ((particles[a].y - particles[b].y) * (particles[a].y - particles[b].y));

          if (distance < (canvas.width / 7) * (canvas.height / 7)) {
            opacityValue = 1 - (distance / 20000);
            ctx.strokeStyle = `rgba(168, 85, 247, ${opacityValue})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    };
    
    const animate = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
      }
      connect();
      animationFrameId = window.requestAnimationFrame(animate);
    };

    const handleResize = () => {
        setCanvasSize();
        init();
    };

    window.addEventListener('resize', handleResize);
    
    setCanvasSize();
    init();
    animate();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
     <div className="fixed top-0 left-0 w-full h-full z-0 overflow-hidden">
      <div className="absolute w-full h-full bg-[radial-gradient(#581c87_1px,transparent_1px)] [background-size:32px_32px] opacity-10"></div>
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
    </div>
  );
};

export default AnimatedBackground;
