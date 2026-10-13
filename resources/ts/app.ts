// @ts-nocheck //
import "../css/app.css"
import $ from "jquery";

const DEVICON = "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/";

// Skill name -> devicon path (or Font Awesome class as fallback)
const SKILL_ICONS = {
  "HTML": "html5/html5-original.svg",
  "CSS": "css3/css3-original.svg",
  "JavaScript": "javascript/javascript-original.svg",
  "TypeScript": "typescript/typescript-original.svg",
  "PHP": "php/php-original.svg",
  "Express.js": "express/express-original.svg|invert",
  "Laravel": "laravel/laravel-original.svg",
  "CakePHP": "cakephp/cakephp-original.svg",
  "React.js": "react/react-original.svg",
  "MySQL": "mysql/mysql-original.svg",
  "MongoDB": "mongodb/mongodb-original.svg",
  "DynamoDB": "dynamodb/dynamodb-original.svg",
  "Git": "git/git-original.svg",
  "Docker": "docker/docker-original.svg",
  "Postman": "postman/postman-original.svg",
  "VS Code": "vscode/vscode-original.svg",
  "Deno": "denojs/denojs-original.svg|round",
  "Node.js": "nodejs/nodejs-original.svg",
  "AWS": "amazonwebservices/amazonwebservices-original-wordmark.svg|invert",
  "Google Console": "googlecloud/googlecloud-original.svg",
  "Vercel": "vercel/vercel-original.svg|invert",
};

const FA_FALLBACK = {
  "Hono.js": "fa-solid fa-fire text-orange-400",
  "Clever Cloud": "fa-solid fa-cloud text-sky-300",
  "Deno Deploy": "fa-solid fa-rocket text-emerald-300",
  "Fly.io": "fa-solid fa-paper-plane text-violet-300",
};

function decorateSkills() {
  $(".skill-chip").each(function () {
    const el = $(this);
    const name = el.data("skill");
    const big = el.hasClass("text-lg");
    const size = big ? "w-7 h-7" : "w-4 h-4";
    const entry = SKILL_ICONS[name];

    if (entry) {
      const [path, mod] = entry.split("|");
      const extra = mod === "invert" ? "invert" : mod === "round" ? "rounded-full bg-white" : "";
      const img = $(`<img alt="" loading="lazy" class="${size} object-contain ${extra}" />`)
        .attr("src", DEVICON + path)
        .on("error", function () { $(this).replaceWith(`<i class="fa-solid fa-code text-indigo-300"></i>`); });
      el.prepend(img);
    } else {
      el.prepend(`<i class="${FA_FALLBACK[name] || "fa-solid fa-code text-indigo-300"}"></i>`);
    }
  });
}

function typewriter() {
  const el = document.getElementById("typed");
  if (!el) return;
  const words = (el.dataset.words || "").split("|").filter(Boolean);
  let w = 0, i = 0, deleting = false;

  const tick = () => {
    const word = words[w];
    i += deleting ? -1 : 1;
    el.textContent = word.slice(0, i);

    let delay = deleting ? 40 : 85;
    if (!deleting && i === word.length) {
      deleting = true;
      delay = 1600;
    } else if (deleting && i === 0) {
      deleting = false;
      w = (w + 1) % words.length;
      delay = 300;
    }
    setTimeout(tick, delay);
  };
  tick();
}

function scrollReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  items.forEach((el) => io.observe(el));
}

function activeNav() {
  const links = $(".nav-link");
  const sections = document.querySelectorAll("section[id]");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        links.removeClass("active");
        links.filter(`[href="#${entry.target.id}"]`).addClass("active");
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach((s) => io.observe(s));
}

function onScroll() {
  const header = document.getElementById("siteHeader");
  const progress = document.getElementById("scrollProgress");
  const update = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header?.classList.toggle("scrolled", y > 20);
    if (progress) progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  };
  window.addEventListener("scroll", update, { passive: true });
  update();
}

function pointerEffects() {
  if (!window.matchMedia("(pointer: fine)").matches) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const glow = document.getElementById("cursorGlow");

  window.addEventListener("pointermove", (e) => {
    if (glow) glow.style.transform = `translate(${e.clientX - 260}px, ${e.clientY - 260}px)`;
  }, { passive: true });

  document.querySelectorAll(".spotlight").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  if (reduce) return;
  document.querySelectorAll(".tilt").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg) translateY(-4px)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

$(document).ready(function () {
  decorateSkills();
  typewriter();
  scrollReveal();
  activeNav();
  onScroll();
  pointerEffects();

  $("#contactForm").on("submit", function (e) {
    e.preventDefault();

    const form = $(this);
    const messageEl = $("#formMessage");
    const button = form.find("button[type='submit']");
    const label = button.find("span");

    // Gather form data
    const data = {
      name: form.find("input[name='name']").val(),
      email: form.find("input[name='email']").val(),
      message: form.find("textarea[name='message']").val(),
    };

    button.prop("disabled", true);
    label.text("Sending...");

    $.ajax({
      url: "/api/send-mail",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(data),
      dataType: "json",
      success: function (res) {
        if (res.success) {
          messageEl
            .text("Your message has been sent!")
            .removeClass("hidden text-red-500")
            .addClass("text-green-500");
          form.trigger("reset");
        } else {
          messageEl
            .text("Failed to send message. Please try again.")
            .removeClass("hidden text-green-500")
            .addClass("text-red-500");
        }
      },
      error: function () {
        messageEl
          .text("An error occurred. Please try again later.")
          .removeClass("hidden text-green-500")
          .addClass("text-red-500");
      },
      complete: function () {
        button.prop("disabled", false);
        label.text("Send Message");
      },
    });
  });

  $("#menuBtn").on("click", function () {
    $("#mobileMenu").slideToggle(200);
  });

  // ===== Close Mobile Menu on Link Click =====
  $("#mobileMenu a").on("click", function () {
    $("#mobileMenu").slideUp(200);
  });
});
