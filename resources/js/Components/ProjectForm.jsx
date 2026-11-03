import { useEffect, useState } from 'react';

const fields = [
    { name: 'title', label: 'Title', type: 'text' },
    { name: 'category', label: 'Category', type: 'text' },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'technologies', label: 'Technologies', type: 'textarea' },
    {
        name: 'status',
        label: 'Status',
        type: 'select',
        options: ['Planning', 'In Progress', 'Completed'],
    },
    { name: 'project_url', label: 'Project URL', type: 'url' },
    { name: 'repository_url', label: 'Repository URL', type: 'url' },
    { name: 'completed_at', label: 'Completion date', type: 'date' },
];

export default function ProjectForm({
    form,
    onSubmit,
    submitLabel,
    imageUrl = null,
    isEditing = false,
}) {
    const [previewUrl, setPreviewUrl] = useState(imageUrl);

    useEffect(() => {
        if (!form.data.image) {
            setPreviewUrl(imageUrl);
            return undefined;
        }

        const objectUrl = URL.createObjectURL(form.data.image);
        setPreviewUrl(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [form.data.image, imageUrl]);

    return (
        <form className="project-admin-form" onSubmit={onSubmit}>
            {fields.map((field) => (
                <div className="project-admin-field" key={field.name}>
                    <label htmlFor={field.name}>
                        {field.label}
                    </label>

                    {field.type === 'select' ? (
                        <select
                            id={field.name}
                            value={form.data[field.name] ?? ''}
                            onChange={(event) =>
                                form.setData(field.name, event.target.value)
                            }
                            required
                        >
                            {field.options.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    ) : field.type === 'textarea' ? (
                        <textarea
                            id={field.name}
                            value={form.data[field.name] ?? ''}
                            onChange={(event) =>
                                form.setData(field.name, event.target.value)
                            }
                            rows={4}
                        />
                    ) : (
                        <input
                            id={field.name}
                            type={field.type}
                            value={form.data[field.name] ?? ''}
                            onChange={(event) =>
                                form.setData(field.name, event.target.value)
                            }
                        />
                    )}

                    {form.errors[field.name] && (
                        <p className="project-admin-error" role="alert">
                            {form.errors[field.name]}
                        </p>
                    )}
                </div>
            ))}

            <div className="project-admin-field project-admin-image-field">
                <label htmlFor="image">Project image</label>
                <input
                    id="image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) =>
                        form.setData('image', event.target.files?.[0] ?? null)
                    }
                    aria-describedby="image-help"
                />
                <p id="image-help" className="project-admin-field-help">
                    Optional. JPG, PNG, or WebP; maximum file size 2 MB.
                </p>
                {isEditing && imageUrl && (
                    <label className="project-admin-remove-image">
                        <input
                            type="checkbox"
                            checked={Boolean(form.data.remove_image)}
                            onChange={(event) =>
                                form.setData('remove_image', event.target.checked)
                            }
                        />
                        Remove current image
                    </label>
                )}
                {previewUrl && !form.data.remove_image && (
                    <img
                        className="project-admin-image-preview"
                        src={previewUrl}
                        alt="Project image preview"
                    />
                )}
                {form.errors.image && (
                    <p className="project-admin-error" role="alert">
                        {form.errors.image}
                    </p>
                )}
            </div>

            <button
                type="submit"
                disabled={form.processing}
                className="project-admin-submit"
            >
                {form.processing ? 'Saving...' : submitLabel}
            </button>
        </form>
    );
}