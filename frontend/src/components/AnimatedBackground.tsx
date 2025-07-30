import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
}

const AnimatedBackground: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const colors = ['#8B7355', '#D2B48C', '#F5DEB3', '#E6D7C3', '#FFFFFF', '#F8F8F8'];
    const initialParticles: Particle[] = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.3 + 0.1,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    setParticles(initialParticles);

    const animate = () => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        x: particle.x + particle.speedX,
        y: particle.y + particle.speedY,
        opacity: particle.opacity + (Math.random() - 0.5) * 0.05,
      })));
    };

    const interval = setInterval(animate, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-neutral-900 to-neutral-800">
        <div className="absolute inset-0 bg-gradient-radial from-white/5 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-radial from-white/3 via-transparent to-transparent" style={{ transform: 'translate(50%, 50%)' }} />
        <div className="absolute inset-0 bg-gradient-radial from-white/4 via-transparent to-transparent" style={{ transform: 'translate(-50%, -50%)' }} />
      </div>

      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full animate-pulse"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            opacity: particle.opacity,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
          }}
        />
      ))}

      <div className="absolute inset-0 opacity-3">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'gradient 20s ease infinite',
        }} />
      </div>

      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-white/3 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-1/4 left-1/2 w-80 h-80 bg-white/4 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '4s' }} />

      <div className="absolute inset-0">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,50 Q25,25 50,50 T100,50"
            stroke="url(#lineGradient)"
            strokeWidth="0.1"
            fill="none"
            className="animate-pulse-slow"
          />
        </svg>
      </div>
    </div>
  );
};

export default AnimatedBackground; 