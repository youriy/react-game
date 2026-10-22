import React from 'react';
import {useTheme} from '@mui/material/styles';

/** Сколько длится залп, мс (последние FADE_TIME мс частицы плавно исчезают). */
const DURATION = 3500;
const FADE_TIME = 800;
/** Частиц в обычном залпе и в большом (новый рекорд или 3 звезды); на телефоне — вдвое меньше. */
const PARTICLES = 150;
const BIG_PARTICLES = 260;
/** Гравитация относительно высоты экрана: чем выше экран, тем быстрее падают — анимация выглядит одинаково. */
const GRAVITY_PER_HEIGHT = 1.6e-6;
/** На какую долю высоты экрана взлетают самые быстрые частицы. */
const LAUNCH_HEIGHT = 0.75;
/** Яркие цвета; к ним добавляется основной цвет текущей темы. */
const COLORS = ["#FFC107", "#E91E63", "#4CAF50", "#2196F3", "#FF5722", "#9C27B0", "#00BCD4"];

const random = (min, max) => min + Math.random() * (max - min);

/**
 * Создаёт частицы залпа: из нижней части экрана веером вверх.
 * Обычный залп — из центра, большой — с двух сторон навстречу друг другу.
 * @param {number} count - сколько частиц
 * @param {boolean} big - большой залп
 * @param {number} width - ширина экрана, px
 * @param {number} height - высота экрана, px
 * @param {string[]} colors
 */
const createParticles = (count, big, width, height, colors) => {
    const gravity = GRAVITY_PER_HEIGHT * height;
    const maxSpeed = Math.sqrt(2 * gravity * height * LAUNCH_HEIGHT);
    // Точки вылета и направление (угол в градусах, -90 — строго вверх)
    const origins = big
        ? [{x: 0.1, angle: -65}, {x: 0.9, angle: -115}]
        : [{x: 0.5, angle: -90}];

    return Array.from({length: count}, (_, i) => {
        const origin = origins[i % origins.length];
        const angle = (origin.angle + random(-28, 28)) * Math.PI / 180;
        const speed = maxSpeed * random(0.6, 1);

        return {
            x: origin.x * width,
            y: height + 10,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            rotation: random(0, Math.PI * 2),
            spin: random(-0.012, 0.012),
            size: random(6, 11),
            color: colors[Math.floor(Math.random() * colors.length)],
            round: Math.random() < 0.3,
        };
    });
};

/**
 * Хук: конфетти поверх всего экрана. Возвращает функцию `fire({big})`, запускающую залп.
 *
 * - рисует на временном `<canvas>` поверх страницы (клики проходят сквозь него);
 * - анимация через requestAnimationFrame, через DURATION мс останавливается и убирает canvas;
 * - повторный залп заменяет текущий; при размонтировании компонента анимация останавливается;
 * - на узком экране частиц вдвое меньше; при системной настройке «уменьшить движение» залпа нет.
 *
 * @returns {function({big?: boolean}=): void}
 * @example
 * const fireConfetti = useConfetti();
 * fireConfetti({big: true});
 */
export default function useConfetti() {
    const theme = useTheme();
    // Остановка текущего залпа (если он идёт)
    const stopRef = React.useRef(null);

    React.useEffect(() => () => stopRef.current && stopRef.current(), []);

    return React.useCallback(({big = false} = {}) => {
        if (stopRef.current) {
            stopRef.current();
        }

        if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            return;
        }

        const width = window.innerWidth;
        const height = window.innerHeight;
        const ratio = window.devicePixelRatio || 1;
        const canvas = document.createElement("canvas");

        canvas.width = width * ratio;
        canvas.height = height * ratio;
        Object.assign(canvas.style, {
            position: "fixed", inset: "0", width: "100%", height: "100%", pointerEvents: "none", zIndex: "2000",
        });
        document.body.appendChild(canvas);

        const context = canvas.getContext("2d");
        context.scale(ratio, ratio);

        const count = Math.round((big ? BIG_PARTICLES : PARTICLES) / (width < theme.breakpoints.values.sm ? 2 : 1));
        const particles = createParticles(count, big, width, height, [...COLORS, theme.palette.primary.main]);
        const gravity = GRAVITY_PER_HEIGHT * height;
        const start = performance.now();
        let last = start;
        let frame;

        const stop = () => {
            cancelAnimationFrame(frame);
            canvas.remove();
            stopRef.current = null;
        };

        const draw = (now) => {
            const elapsed = now - start;
            const dt = Math.min(now - last, 50);
            last = now;

            if (elapsed > DURATION) {
                stop();
                return;
            }

            context.clearRect(0, 0, width, height);
            context.globalAlpha = Math.min(1, (DURATION - elapsed) / FADE_TIME);

            particles.forEach(particle => {
                // Сопротивление воздуха и гравитация
                particle.vx *= Math.pow(0.999, dt);
                particle.vy += gravity * dt;
                particle.x += particle.vx * dt;
                particle.y += particle.vy * dt;
                particle.rotation += particle.spin * dt;

                context.save();
                context.translate(particle.x, particle.y);
                context.rotate(particle.rotation);
                context.fillStyle = particle.color;

                if (particle.round) {
                    context.beginPath();
                    context.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
                    context.fill();
                } else {
                    // «Кувыркание» бумажки: ширина пульсирует от поворота
                    context.fillRect(-particle.size / 2, -particle.size / 4,
                        particle.size * Math.abs(Math.cos(particle.rotation * 2)), particle.size / 2);
                }

                context.restore();
            });

            frame = requestAnimationFrame(draw);
        };

        stopRef.current = stop;
        frame = requestAnimationFrame(draw);
    }, [theme]);
}
