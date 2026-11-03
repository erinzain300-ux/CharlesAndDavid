import { Head, Link, useForm } from '@inertiajs/react';
import ProjectForm from '@/Components/ProjectForm';

export default function Create() {
    const form = useForm({
        title: '',
        category: '',
        description: '',
        technologies: '',
        status: 'Planning',
        image: null,
        project_url: '',
        repository_url: '',
        completed_at: '',
    });

    function submit(event) {
        event.preventDefault();
        form.post(route('projects.store'));
    }

    return (
        <>
            <Head title="Add Project" />

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

                        <p className="project-admin-kicker">作品 / NEW WORK</p>
                        <h1 className="project-admin-title">Add a project</h1>
                        <p className="project-admin-intro">
                            Add a new piece to your portfolio. Your project will
                            appear in the Projects gallery after saving.
                        </p>

                        <ProjectForm
                            form={form}
                            onSubmit={submit}
                            submitLabel="Create project"
                            isEditing={false}
                        />
                    </section>
                </div>
            </main>
        </>
    );
}