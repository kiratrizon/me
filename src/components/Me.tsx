import { useState, useEffect } from "react";
import Projects from "./Projects";

const apiUrl = import.meta.env.VITE_API_URL || "https://honovel.deno.dev";
export function Hero() {
  const downloadResume = async () => {
    const endpoint = "/api/portfolio/my-resume";
    try {
      const response = await fetch(apiUrl + endpoint);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "genesis-troy-torrecampo-web-developer.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  };

  return (
    <section className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 px-4">
      <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        Genesis Troy Torrecampo
      </h1>
      <h2 className="text-xl md:text-2xl text-gray-800 mt-2">Web Developer</h2>
      <p className="text-lg text-gray-500 mt-2">
        Building full-stack apps with Deno, React & modern web technologies.
      </p>
      <p className="text-gray-600 mt-4 max-w-xl">
        I specialize in creating modern, efficient, and user-friendly web
        applications. Passionate about seamless UX and writing clean,
        maintainable code.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <a
          href="#projects"
          className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-medium shadow hover:bg-indigo-700 transition"
        >
          View My Work
        </a>
        <button
          className="px-6 py-3 rounded-2xl bg-gray-800 text-white font-medium shadow hover:bg-gray-900 transition hover:cursor-pointer"
          onClick={downloadResume}
        >
          Download Resume
        </button>
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

export function Main() {
  // my projects state
  const [myProjects, setMyProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(
          `${apiUrl}/api/portfolio/projects`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
            },
          }
        ); // post
        if (response.ok) {
          const data = await response.json();
          setMyProjects(data);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    fetchProjects();
  }, []);
  return (
    <main>
      {/* About Section */}
      <section id="about" className="px-6 py-20 bg-white text-center">
        <h2 className="text-3xl font-bold text-gray-900">About Me</h2>
        <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
          I’m a web developer specializing in Deno and React. I enjoy building
          efficient, scalable applications and crafting smooth user experiences.
        </p>
      </section>

      {/* Projects Section */}
      <Projects projects={myProjects} />

      {/* Contact Section */}
      <section id="contact" className="px-6 py-20 bg-white text-center">
        <h2 className="text-3xl font-bold text-gray-900">Get In Touch</h2>
        <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
          Have a project in mind or want to collaborate? Feel free to reach out!
        </p>
        <a
          href="mailto:tgenesistroy@gmail.com"
          className="mt-6 inline-block px-6 py-3 rounded-2xl bg-indigo-600 text-white font-medium shadow hover:bg-indigo-700 transition"
        >
          Say Hello
        </a>
      </section>
    </main>
  );
}

export function Footer() {
  return (
    <footer className="w-full bg-gray-900 text-gray-300 mt-12">
      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between text-sm">
        <p>
          &copy; {new Date().getFullYear()} Genesis Troy Torrecampo. All rights
          reserved.
        </p>
        <div className="flex gap-6 mt-4 sm:mt-0">
          <a
            href="https://github.com/kiratrizon"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/genesis-troy-torrecampo-8bbb922a5/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition"
          >
            LinkedIn
          </a>
          <a
            href="mailto:tgenesistroy@gmail.com"
            className="hover:text-white transition"
          >
            Email
          </a>
        </div>
      </div>
    </footer>
  );
}
