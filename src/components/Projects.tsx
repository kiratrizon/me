export default function Projects({
  projects,
}: {
  projects: Array<Record<string, any>>;
}) {
  return (
    <section id="projects" className="px-6 py-20 bg-gray-50">
      <h2 className="text-3xl font-bold text-gray-900 text-center">Projects</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 max-w-5xl mx-auto">
        {/* Example Project Card */}
        {projects.map((project, index) => {
          return (
            <div
              key={project.id || index}
              className="rounded-2xl shadow bg-white p-6 hover:shadow-lg transition"
            >
              <h3 className="text-xl font-semibold text-indigo-600">
                {project.project_name}
              </h3>
              <p className="text-gray-600 mt-2">{project.description}</p>
              <div className="mt-4 flex gap-3">
                {project.github_url ? (
                  <a
                    href={project.github_url}
                    target="_blank"
                    className="text-indigo-600 font-medium hover:underline hover:cursor-pointer"
                  >
                    Source Code
                  </a>
                ) : null}
                {project.live_demo_url ? (
                  <a
                    href={project.live_demo_url}
                    target="_blank"
                    className="text-gray-700 font-medium hover:underline hover:cursor-pointer"
                  >
                    Live Demo
                  </a>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
