import { readFileSync, writeFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import Home from "./pages/index";
import Privacy from "./pages/privacidad";
import Terms from "./pages/condiciones";
import NotFound from "./pages/404";

for (const [name, Page] of Object.entries({
  index: Home,
  privacidad: Privacy,
  condiciones: Terms,
  404: NotFound,
})) {
  const template = readFileSync(`web/src/pages/${name}.html`, "utf8");
  const body = renderToStaticMarkup(<Page />);
  if (!template.includes("<!--prana:body-->"))
    throw new Error(`Falta el marcador del contenido: ${name}`);
  writeFileSync(
    `web/public/${name}.html`,
    template.replace("<!--prana:body-->", body),
  );
}
