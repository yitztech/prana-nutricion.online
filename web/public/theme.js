// Aplica el tema antes de pintar: el elegido (localStorage) o el del sistema.
// Se carga sin defer desde index.html; la misma clave usa src/hooks/use-theme.ts.
(function () {
  var theme = null;
  try {
    theme = localStorage.getItem("prana-tema");
  } catch (e) {}
  if (theme !== "light" && theme !== "dark") {
    theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  if (theme === "dark") document.documentElement.classList.add("dark");
})();
