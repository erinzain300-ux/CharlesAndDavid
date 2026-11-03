import { useEffect, useRef, useState } from 'react';
import { Head } from '@inertiajs/react';

export default function Portfolio({ projects = [] }) {
    const petalCanvasRef = useRef(null);
    const [isDark, setIsDark] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [themeStatus, setThemeStatus] = useState('');

    useEffect(() => {
        let preferredTheme;

        try {
            preferredTheme = localStorage.getItem('portfolio-theme');
        } catch {
            setThemeStatus('Theme preference storage is unavailable; using your system theme.');
        }

        if (preferredTheme !== 'dark' && preferredTheme !== 'light') {
            preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light';
        }

        setIsDark(preferredTheme === 'dark');
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDark);

        const themeColor = document.querySelector('meta[name="theme-color"]');
        if (themeColor) {
            themeColor.content = isDark ? '#171918' : '#f8f6f0';
        }
    }, [isDark]);

    useEffect(() => {
        if (!menuOpen) return undefined;

        function closeMenuOnEscape(event) {
            if (event.key === 'Escape') {
                setMenuOpen(false);
            }
        }

        function closeMenuOnDesktop(event) {
            if (event.matches) {
                setMenuOpen(false);
            }
        }

        const desktopQuery = window.matchMedia('(min-width: 768px)');
        window.addEventListener('keydown', closeMenuOnEscape);
        desktopQuery.addEventListener('change', closeMenuOnDesktop);

        return () => {
            window.removeEventListener('keydown', closeMenuOnEscape);
            desktopQuery.removeEventListener('change', closeMenuOnDesktop);
        };
    }, [menuOpen]);

    useEffect(() => {
        const sections = document.querySelectorAll('.scene-section');

        if (!('IntersectionObserver' in window)) {
            sections.forEach((section) => section.classList.add('scene-in-view'));
            return undefined;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    entry.target.classList.toggle('scene-in-view', entry.isIntersecting);
                });
            },
            { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1], rootMargin: '-12% 0px -12% 0px' },
        );

        sections.forEach((section) => observer.observe(section));

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const canvas = petalCanvasRef.current;
        const context = canvas?.getContext('2d');

        if (!canvas || !context) return undefined;

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const colors = isDark
            ? ['rgba(177, 203, 255, 0.88)', 'rgba(238, 204, 132, 0.76)']
            : ['rgba(218, 113, 143, 0.82)', 'rgba(245, 171, 187, 0.76)'];
        const petals = Array.from({ length: 18 }, () => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            size: 4 + Math.random() * 5,
            speed: 0.35 + Math.random() * 0.7,
            drift: (Math.random() - 0.5) * 0.5,
            angle: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * 0.025,
        }));
        let frameId;
        let previousTime = 0;
        let width = 0;
        let height = 0;

        function resizeCanvas() {
            const ratio = Math.min(window.devicePixelRatio || 1, 2);
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = Math.round(width * ratio);
            canvas.height = Math.round(height * ratio);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            context.setTransform(ratio, 0, 0, ratio, 0, 0);
        }

        function draw(timestamp) {
            const frameScale = previousTime
                ? Math.min((timestamp - previousTime) / 16.67, 2.5)
                : 1;
            previousTime = timestamp;
            context.clearRect(0, 0, width, height);

            petals.forEach((petal, index) => {
                context.save();
                context.translate(petal.x, petal.y);
                context.rotate(petal.angle);
                context.fillStyle = colors[index % colors.length];
                context.beginPath();
                context.ellipse(0, 0, petal.size * 0.55, petal.size, 0, 0, Math.PI * 2);
                context.fill();
                context.restore();

                petal.x += (petal.drift + Math.sin(petal.y * 0.008 + index) * 0.2) * frameScale;
                petal.y += petal.speed * frameScale;
                petal.angle += petal.spin * frameScale;

                if (petal.y > height + 16 || petal.x < -16 || petal.x > width + 16) {
                    petal.x = Math.random() * width;
                    petal.y = -16 - Math.random() * Math.min(height, 240);
                }
            });

            frameId = window.requestAnimationFrame(draw);
        }

        function start() {
            if (document.visibilityState === 'visible' && !reducedMotion.matches && !frameId) {
                frameId = window.requestAnimationFrame(draw);
            }
        }

        function stop() {
            if (frameId) {
                window.cancelAnimationFrame(frameId);
                frameId = undefined;
            }
        }

        function handleMotionPreferenceChange() {
            if (reducedMotion.matches) {
                stop();
                context.clearRect(0, 0, width, height);
            } else {
                start();
            }
        }

        function handleVisibilityChange() {
            if (document.visibilityState === 'hidden') {
                stop();
            } else {
                start();
            }
        }

        resizeCanvas();
        start();
        window.addEventListener('resize', resizeCanvas);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        reducedMotion.addEventListener('change', handleMotionPreferenceChange);

        return () => {
            stop();
            window.removeEventListener('resize', resizeCanvas);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            reducedMotion.removeEventListener('change', handleMotionPreferenceChange);
            context.clearRect(0, 0, width, height);
        };
    }, [isDark]);

    function toggleTheme() {
        const nextIsDark = !isDark;
        const nextTheme = nextIsDark ? 'dark' : 'light';

        setIsDark(nextIsDark);

        try {
            localStorage.setItem('portfolio-theme', nextTheme);
            setThemeStatus(`${nextTheme === 'dark' ? 'Dark' : 'Light'} mode enabled.`);
        } catch {
            setThemeStatus('Theme changed, but this browser could not save your preference.');
        }
    }

    return (
        <>
            <Head title="My Portfolio" />

            <canvas
                ref={petalCanvasRef}
                aria-hidden="true"
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 10,
                    pointerEvents: 'none',
                }}
            />

            <header className="sticky top-0 z-40 border-b border-line/80 bg-washi/90 text-ink backdrop-blur-md dark:border-line-dark/80 dark:bg-sumi/90 dark:text-cream">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-5 py-4 sm:px-8">
                    <a href="#home" className="font-serif font-semibold">
                        <span className="text-sakura dark:text-sakura-dark">余白</span>
                        <span className="ml-2">MyPortfolio</span>
                    </a>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <button
                            id="theme-toggle"
                            type="button"
                            onClick={toggleTheme}
                            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                            aria-pressed={isDark}
                            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-line text-lg transition hover:border-sakura hover:text-sakura focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sakura dark:border-line-dark dark:hover:text-sakura-dark dark:focus-visible:outline-sakura-dark"
                        >
                            <span aria-hidden="true">{isDark ? '☀' : '☾'}</span>
                        </button>

                        <button
                            id="menu-toggle"
                            type="button"
                            onClick={() => setMenuOpen((open) => !open)}
                            aria-label={`${menuOpen ? 'Close' : 'Open'} navigation menu`}
                            aria-expanded={menuOpen}
                            aria-controls="primary-navigation"
                            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-line text-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sakura dark:border-line-dark md:hidden"
                        >
                            <span aria-hidden="true">{menuOpen ? '×' : '☰'}</span>
                        </button>

                        <nav
                            id="primary-navigation"
                            aria-label="Main navigation"
                            className={`${menuOpen ? 'flex' : 'hidden'} absolute left-0 right-0 top-full border-b border-line bg-washi px-5 py-4 shadow-soft dark:border-line-dark dark:bg-sumi md:static md:flex md:items-center md:border-0 md:bg-transparent md:p-0 md:shadow-none`}
                        >
                            <ul className="flex w-full flex-col gap-1 md:w-auto md:flex-row md:items-center md:gap-6">
                                {[
                                    ['home', 'Home'],
                                    ['about', 'About'],
                                    ['skills', 'Skills'],
                                    ['projects', 'Projects'],
                                    ['journey', 'Journey'],
                                    ['contact', 'Contact'],
                                ].map(([section, label]) => (
                                    <li key={section}>
                                        <a
                                            className="nav-link block rounded px-3 py-2 text-muted hover:text-indigo focus-visible:outline focus-visible:outline-2 focus-visible:outline-sakura dark:text-muted-dark dark:hover:text-sakura-dark"
                                            href={`#${section}`}
                                            onClick={() => setMenuOpen(false)}
                                        >
                                            {label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>
                </div>
                <p className="sr-only" role="status" aria-live="polite">
                    {themeStatus}
                </p>
            </header>

            <main>
                <section id="home" className="scene-section">
                    <div className="scene-content mx-auto grid max-w-6xl items-center gap-12 px-5 sm:px-8 md:grid-cols-[1.2fr_0.8fr]">
                        <div className="scene-copy-card">
                            <p className="mb-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-sakura dark:text-sakura-dark">
                                <span className="h-px w-9 bg-sakura dark:bg-sakura-dark" aria-hidden="true" />
                                A little introduction
                            </p>
                            <h1 className="max-w-3xl [container-type:inline-size] font-serif font-medium leading-tight tracking-tight">
                                <span className="block break-words text-[clamp(1.5rem,7cqi,2.75rem)] md:inline">
                                    Cagalawan, Charles Ashraf
                                </span>
                                <span className="block text-center text-[clamp(1.5rem,7cqi,2.75rem)] md:inline">
                                    {' '}E.
                                </span>
                            </h1>
                            <div className="relative mx-auto my-7 w-full max-w-[12rem] md:hidden">
                                <div className="avatar-sakura-frame absolute -right-2 -top-2 h-full w-full rounded-2xl" aria-hidden="true" />
                                <div className="relative z-0 overflow-hidden rounded-2xl border border-line bg-paper p-2 shadow-soft dark:border-line-dark dark:bg-[#202220]">
                                    <img
                                        src="/images/profile-photo.jpg"
                                        alt="Portrait photo of me wearing my school uniform"
                                        className="aspect-[4/5] w-full rounded-xl object-cover"
                                    />
                                    <div className="flex justify-end px-2 py-1">
                                        <span className="hanko" aria-label="Personal portfolio">印</span>
                                    </div>
                                </div>
                            </div>
                            <p className="mt-3 text-base font-normal leading-relaxed text-muted dark:text-muted-dark sm:text-xl">
                                Building thoughtful solutions through technology.
                            </p>
                            <p className="mt-7 max-w-xl text-base leading-8 text-muted dark:text-muted-dark sm:text-lg">
                                I’m a curious maker who enjoys turning thoughtful
                                ideas into useful, welcoming digital experiences.
                            </p>

                            <div className="mt-9 flex flex-wrap items-center gap-4">
                                <a
                                    href="#projects"
                                    className="inline-flex min-h-12 items-center justify-center rounded-md bg-indigo px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-indigo/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sakura dark:bg-indigo-dark dark:text-sumi dark:hover:bg-indigo-dark/90 dark:focus-visible:outline-sakura-dark"
                                >
                                    View my projects <span className="ml-3" aria-hidden="true">↘</span>
                                </a>
                                <a
                                    href="#about"
                                    className="rounded-md px-3 py-3 text-sm font-medium text-muted underline decoration-line underline-offset-4 hover:text-indigo focus-visible:outline focus-visible:outline-2 focus-visible:outline-sakura dark:text-muted-dark dark:decoration-line-dark dark:hover:text-sakura-dark"
                                >
                                    A little about me
                                </a>
                            </div>
                            <p className="mt-12 text-base text-muted dark:text-muted-dark">
                                <span className="mr-2 text-sakura dark:text-sakura-dark" aria-hidden="true">一</span>
                                Thoughtful work, one detail at a time.
                            </p>
                        </div>

                        <div className="relative mx-auto hidden w-full max-w-[18rem] md:block md:max-w-sm">
                            <div className="avatar-sakura-frame absolute -right-3 -top-3 h-full w-full rounded-2xl" aria-hidden="true" />
                            <div className="relative z-0 overflow-hidden rounded-2xl border border-line bg-paper p-3 shadow-soft dark:border-line-dark dark:bg-[#202220]">
                                <img
                                    src="/images/profile-photo.jpg"
                                    alt="Portrait photo of me wearing my school uniform"
                                    className="aspect-[4/5] w-full rounded-xl object-cover"
                                />
                                <div className="flex justify-end px-2 py-1">
                                    <span className="hanko" aria-label="Personal portfolio">印</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="about" className="scene-section">
                    <div className="scene-content mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-2">
                        <div className="scene-copy-card">
                            <p className="section-kicker">私について / ABOUT</p>
                            <h2 className="section-title">A little about me</h2>
                        </div>

                        <div className="scene-copy-card">
                            <p className="text-lg leading-9">
                                I’m Cagalawan, Charles Ashraf E., an Information
                                Technology student at Urdaneta City University.
                                I enjoy developing useful applications, creating
                                websites, solving problems, and learning new
                                technologies.
                            </p>

                            <div className="mt-8">
                                <h3 className="font-serif text-lg font-medium">
                                    What I’m working toward
                                </h3>
                                <p className="mt-2 leading-7">
                                    My goal is to grow as an IT professional,
                                    creating accessible and useful digital
                                    experiences while continuing to learn from
                                    every project.
                                </p>
                            </div>

                            <p className="mt-6 leading-7">
                                Outside of projects, I enjoy playing games and
                                exploring new ideas.
                            </p>
                        </div>
                    </div>
                </section>

                <section id="skills" className="scene-section">
                    <div className="scene-content mx-auto max-w-6xl px-5">
                        <div className="scene-copy-card mb-10">
                            <p className="section-kicker">できること / SKILLS</p>
                            <h2 className="section-title">
                                Tools I use, ways I work
                            </h2>
                            <p className="mt-4 leading-7">
                                A growing toolkit, shaped by practice and
                                collaboration.
                            </p>
                        </div>

                        <div className="grid gap-5 md:grid-cols-3">
                            <article className="skill-card">
                                <span className="skill-mark">01</span>
                                <h3 className="skill-heading">Web &amp; code</h3>
                                <ul className="skill-list">
                                    <li>HTML and accessible structure</li>
                                    <li>CSS and responsive layouts</li>
                                    <li>JavaScript fundamentals</li>
                                    <li>Git and GitHub</li>
                                </ul>
                            </article>

                            <article className="skill-card">
                                <span className="skill-mark">02</span>
                                <h3 className="skill-heading">Design &amp; making</h3>
                                <ul className="skill-list">
                                    <li>Wireframes and prototyping</li>
                                    <li>Visual design basics</li>
                                    <li>Figma</li>
                                    <li>Writing for the web</li>
                                </ul>
                            </article>

                            <article className="skill-card">
                                <span className="skill-mark">03</span>
                                <h3 className="skill-heading">A.I. I use</h3>
                                <ul className="skill-list">
                                    <li>ChatGPT</li>
                                    <li>Gemini</li>
                                    <li>Claude</li>
                                    <li>Copilot</li>
                                </ul>
                            </article>
                        </div>
                    </div>
                </section>

                <section id="projects" className="scene-section">
                    <div className="scene-content mx-auto max-w-6xl px-5">
                        <div className="scene-copy-card">
                            <p className="section-kicker">作品 / SELECTED WORK</p>
                            <h2 className="section-title">A gallery for my work</h2>
                            <p className="mt-4 leading-7">
                                Projects shown here are loaded from the database.
                            </p>
                            <a
                                href="/projects"
                                className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-indigo px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-indigo/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sakura dark:bg-indigo-dark dark:text-sumi dark:hover:bg-indigo-dark/90 dark:focus-visible:outline-sakura-dark"
                            >
                                Manage Projects
                            </a>
                        </div>

                        {projects.length === 0 ? (
                            <p className="mt-8">No projects have been added yet.</p>
                        ) : (
                            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {projects.map((project) => (
                                    <article className="project-card" key={project.id}>
                                        {project.image_url && (
                                            <img
                                                className="project-card-image"
                                                src={project.image_url}
                                                alt={`${project.title} project`}
                                                loading="lazy"
                                            />
                                        )}
                                        <div className="p-5">
                                            <p className="project-category">
                                                {project.category}
                                            </p>
                                            {project.status && (
                                                <p className="mt-2 text-sm font-medium">
                                                    Status: {project.status}
                                                </p>
                                            )}

                                            <h3 className="mt-2 font-serif text-xl font-medium">
                                                {project.title}
                                            </h3>
                                            <p className="mt-3 leading-7">
                                                {project.description}
                                            </p>
                                            <p className="mt-3">
                                                <strong>Technologies:</strong>{' '}
                                                {project.technologies}
                                            </p>

                                            {project.completed_at && (
                                                <p className="mt-2">
                                                    <strong>Completed:</strong>{' '}
                                                    {project.completed_at}
                                                </p>
                                            )}

                                            {project.project_url && (
                                                <p className="mt-3">
                                                    <a
                                                        href={project.project_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        View project ↗
                                                    </a>
                                                </p>
                                            )}

                                            {project.repository_url && (
                                                <p className="mt-2">
                                                    <a
                                                        href={project.repository_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        View repository ↗
                                                    </a>
                                                </p>
                                            )}
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                <section id="journey" className="scene-section">
                    <div className="scene-content mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-2">
                        <div className="scene-copy-card">
                            <p className="section-kicker">学びの道 / JOURNEY</p>
                            <h2 className="section-title">Learning as I go</h2>
                            <p className="mt-4 leading-7">
                                Training and experiences that continue to shape
                                my skills in technology and development.
                            </p>
                        </div>

                        <ol className="scene-copy-card timeline">
                            <li className="timeline-item">
                                <p className="timeline-date">2024</p>
                                <h3 className="mt-1 font-serif text-lg font-medium">
                                    Computer Systems Servicing NC II
                                </h3>
                                <p className="mt-2 leading-7">
                                    TESDA · Earned my National Certificate II in
                                    Computer Systems Servicing.
                                </p>
                            </li>
                            <li className="timeline-item">
                                <p className="timeline-date">2025</p>
                                <h3 className="mt-1 font-serif text-lg font-medium">
                                    Programming Seminar
                                </h3>
                                <p className="mt-2 leading-7">
                                    Strengthened my understanding of programming
                                    fundamentals and problem-solving.
                                </p>
                            </li>
                            <li className="timeline-item">
                                <p className="timeline-date">2026</p>
                                <h3 className="mt-1 font-serif text-lg font-medium">
                                    Professional Use of Artificial Intelligence
                                </h3>
                                <p className="mt-2 leading-7">
                                    Explored practical and responsible uses of AI
                                    tools for productivity and problem-solving.
                                </p>
                            </li>
                        </ol>
                    </div>
                </section>

                <section id="contact" className="scene-section">
                    <div className="scene-content mx-auto max-w-6xl px-5">
                        <div className="scene-copy-card">
                            <p className="section-kicker">つながりましょう / CONTACT</p>
                            <h2 className="section-title">
                                Let’s start a conversation
                            </h2>
                            <p className="mt-4 max-w-md leading-7">
                                Have a question, an idea, or just want to say
                                hello? I’d be happy to hear from you.
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="scene-section">
                <div className="scene-content mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 md:flex-row md:items-center md:justify-between">
                    <p>
                        © {new Date().getFullYear()} Cagalawan, Charles Ashraf E.
                        Made with care.
                    </p>
                    <a href="#home">Back to top ↑</a>
                </div>
            </footer>
        </>
    );
}