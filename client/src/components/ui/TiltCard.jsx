import React, { useRef, useState } from 'react';

const TiltCard = ({ children, className = "", disabled = false, isCompleted = false, onClick, style = {} }) => {
    const cardRef = useRef(null);
    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    const [position, setPosition] = useState({ x: 50, y: 50 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e) => {
        if (!cardRef.current || disabled) return;

        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Calculate rotation (limiting to +/- 5 degrees for subtle effect)
        // const rotateX = ((y - centerY) / centerY) * -5;
        // const rotateY = ((x - centerX) / centerX) * 5;

        // setRotation({ x: rotateX, y: rotateY });
        setRotation({ x: 0, y: 0 }); // DISABLED TILT
        setPosition({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
        setOpacity(1);
    };

    const handleMouseLeave = () => {
        setRotation({ x: 0, y: 0 });
        setOpacity(0);
    };

    return (
        <div
            ref={cardRef}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale3d(1, 1, 1)`,
                transition: 'transform 0.1s ease-out, box-shadow 0.3s ease',
                ...style
            }}
            className={`relative overflow-hidden preserve-3d transition-all duration-300 ${className} ${disabled ? '' : 'hover:z-10'}`}
        >
            {/* Holographic Sheen for Completed/Premium Items */}
            {isCompleted && (
                <div
                    className="absolute inset-0 pointer-events-none z-20 mix-blend-overlay opacity-30"
                    style={{
                        background: `linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.8) 45%, rgba(255, 215, 0, 0.6) 50%, rgba(255, 255, 255, 0.8) 55%, transparent 60%)`,
                        transform: `translateX(${(position.x - 50) * 2}%) translateY(${(position.y - 50) * 2}%)`,
                        filter: 'blur(2px)'
                    }}
                />
            )}

            {/* Spotlight Effect for Active Items */}
            {!disabled && !isCompleted && (
                <div
                    className="absolute inset-0 pointer-events-none z-20 mix-blend-soft-light transition-opacity duration-500"
                    style={{
                        opacity,
                        background: `radial-gradient(circle at ${position.x}% ${position.y}%, rgba(255,255,255,0.8), transparent 40%)`
                    }}
                />
            )}

            {children}
        </div>
    );
};

export default TiltCard;
