import { Head, Link, useForm } from '@inertiajs/react';
import ProjectForm from '@/Components/ProjectForm';

export default function Edit({ project }) {
    const form = useForm({
        title: project.title ?? '',
        category: project.category ?? '',
        description: project.description ?? '',
        technologies: project.technologies ?? '',
        status: project.status ?? 'Planning',
        image: null,
        remove_image: false,
        project_url: project.project_url ?? '',
        repository_url: project.repository_url ?? '',
        completed_at: project.completed_at
            ? project.completed_at.slice(0, 10)
            : '',
    });

    function submit(event) {
        event.preventDefault();
        form.transform((data) => ({ ...data, _method: 'put' }));
        form.post(route('projects.update', project.id));
    }

    return (
        <>
            <Head title="Edit Project" />

            <main className="project-admin-page">
                <div className="project-admin-wrap">
                    <Link href="/" className="project-admin-brand">
                        余白 <span>MyPortfolio</span>
                    </Link>

                    <section className="project-admin-panel">
                        <Link
                            href={route('projects.index')}
                            className="project-admin-back"
                        >
                            <span aria-hidden="true">←</span> Back to projects
                        </Link>

                        <p className="project-admin-kicker">作品 / UPDATE WORK</p>
                        <h1 className="project-admin-title">Edit project</h1>
                        <p className="project-admin-intro">
                            Refine the details below and save your changes to
                            update the portfolio gallery.
                        </p>

                        <ProjectForm
                            form={form}
                            onSubmit={submit}
                            submitLabel="Save changes"
                            imageUrl={project.image_url}
                            isEditing
                        />
                    </section>
                </div>
            </main>
        </>
    );
}