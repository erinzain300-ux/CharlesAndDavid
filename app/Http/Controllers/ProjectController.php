<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function index()
    {
        return Inertia::render('Projects/Index', [
            'projects' => Project::latest()->paginate(10),
            'status' => session('status'),
        ]);
    }

    public function create()
    {
        return Inertia::render('Projects/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:150', 'unique:projects,title'],
            'category' => ['required', 'string', 'max:50'],
            'description' => ['required', 'string', 'max:2000'],
            'technologies' => ['required', 'string', 'max:500'],
            'status' => ['required', 'string', Rule::in(['Planning', 'In Progress', 'Completed'])],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'project_url' => ['nullable', 'url', 'max:2048'],
            'repository_url' => ['nullable', 'url', 'max:2048'],
            'completed_at' => ['nullable', 'date'],
        ], [
            'title.unique' => 'A project with this title already exists.',
        ]);

        if ($request->hasFile('image')) {
            $validated['image_path'] = $this->storeImage($request);
        }

        unset($validated['image']);
        Project::create($validated);

        return redirect()->route('projects.index')->with('status', 'Project created successfully.');
    }

    public function edit(Project $project)
    {
        return Inertia::render('Projects/Edit', [
            'project' => $project,
        ]);
    }

    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
            'title' => [
                'required',
                'string',
                'max:150',
                Rule::unique('projects', 'title')->ignore($project->id),
            ],
            'category' => ['required', 'string', 'max:50'],
            'description' => ['required', 'string', 'max:2000'],
            'technologies' => ['required', 'string', 'max:500'],
            'status' => ['required', 'string', Rule::in(['Planning', 'In Progress', 'Completed'])],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'remove_image' => ['nullable', 'boolean'],
            'project_url' => ['nullable', 'url', 'max:2048'],
            'repository_url' => ['nullable', 'url', 'max:2048'],
            'completed_at' => ['nullable', 'date'],
        ], [
            'title.unique' => 'A project with this title already exists.',
        ]);

        $previousImagePath = $project->image_path;

        if ($request->hasFile('image')) {
            $validated['image_path'] = $this->storeImage($request);
        } elseif ($request->boolean('remove_image')) {
            $validated['image_path'] = null;
        }

        unset($validated['image']);
        unset($validated['remove_image']);
        $project->update($validated);

        if ($previousImagePath && $project->image_path !== $previousImagePath) {
            Storage::disk('public')->delete($previousImagePath);
        }

        return redirect()->route('projects.index')->with('status', 'Project updated successfully.');
    }

    public function destroy(Project $project)
    {
        $imagePath = $project->image_path;
        $project->delete();

        if ($imagePath) {
            Storage::disk('public')->delete($imagePath);
        }

        return redirect()->route('projects.index')->with('status', 'Project deleted successfully.');
    }

    private function storeImage(Request $request): string
    {
        $path = $request->file('image')->store('projects', 'public');

        if (! $path) {
            throw ValidationException::withMessages([
                'image' => 'The image could not be saved. Please try again.',
            ]);
        }

        return $path;
    }
}
