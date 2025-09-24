export function Hero() {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen text-center bg-gray-50 px-4">
      <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
        Genesis Troy Torrecampo
      </h1>
      <h2 className="text-xl md:text-2xl text-indigo-600 mt-2">
        Web Developer
      </h2>
      <p className="text-gray-600 mt-4 max-w-xl">
        Web developer focused on performance and simplicity.
      </p>

      <div className="mt-8 flex gap-4">
        <a
          href="#projects"
          className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-medium shadow hover:bg-indigo-700 transition"
        >
          View My Work
        </a>
        <a
          href="#contact"
          className="px-6 py-3 rounded-2xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition"
        >
          Contact Me
        </a>
      </div>
    </section>
  );
}
