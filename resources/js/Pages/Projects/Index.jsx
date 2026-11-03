import { Head, Link, router } from '@inertiajs/react';

export default function Index({ projects, status }) {
    function deleteProject(project) {
        if (window.confirm(`Are you sure you want to delete "${project.title}"?`)) {
            router.delete(route('projects.destroy', project.id));
        }
    }

    return (
        <>
            <Head title="Projects" />

            <main className="project-admin-page">
                <div className="project-admin-wrap">
                    <Link href="/" className="project-admin-brand">
                        余白 <span>MyPortfolio</span>
                    </Link>

                    <section className="project-admin-panel project-admin-list">
                        <Link href="/#projects" className="project-admin-back">
                            <span aria-hidden="true">←</span> Back to portfolio
                        </Link>

                        <div className="project-admin-list-heading">
                            <div>
                                <p className="project-admin-kicker">作品 / PORTFOLIO</p>
                                <h1 className="project-admin-title">Manage projects</h1>
                                <p className="project-admin-intro">
                                    Create, update, and curate the work shown in your public portfolio.
                                </p>
                            </div>
                            <Link
                                href={route('projects.create')}
                                className="project-admin-submit project-admin-add"
                            >
                                <span aria-hidden="true">＋</span> Add project
                            </Link>
                        </div>

                        {status && (
                            <p className="project-admin-status" role="status">
                                <span aria-hidden="true">✿</span> {status}
                            </p>
                        )}

                        {projects.data.length === 0 ? (
                            <div className="project-admin-empty">
                                <span aria-hidden="true">✿</span>
                                <h2>Your gallery is waiting</h2>
                                <p>Add your first project to see it featured on your portfolio.</p>
                            </div>
                        ) : (
                            <div className="project-admin-grid">
                        {projects.data.map((project) => (
                            <article className="project-admin-card" key={project.id}>
                                {project.image_url && (
                                    <img
                                        className="project-admin-card-image"
                                        src={project.image_url}
                                        alt={`${project.title} project`}
                                        loading="lazy"
                                    />
                                )}
                                <p className="project-admin-card-category">{project.category}</p>
                                <h2>{project.title}</h2>
                                <p className="project-admin-card-description">{project.description}</p>
                                <p className="project-admin-card-tech">
                                    <strong>Technologies</strong>
                                    <span>{project.technologies}</span>
                                </p>

                                {project.project_url && (
                                    <p className="project-admin-card-link">
                                        <a
                                            href={project.project_url}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            View project
                                        </a>
                                    </p>
                                )}

                                {project.repository_url && (
                                    <p className="project-admin-card-link">
                                        <a
                                            href={project.repository_url}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            View repository
                                        </a>
                                    </p>
                                )}

                                <div className="project-admin-actions">
                                    <Link
                                        href={route('projects.edit', project.id)}
                                        className="project-admin-edit"
                                    >
                                        Edit project
                                    </Link>

                                    <button
                                        type="button"
                                        onClick={() => deleteProject(project)}
                                        className="project-admin-delete"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </article>
                        ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </>
    );
}