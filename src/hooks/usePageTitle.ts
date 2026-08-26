import { useEffect } from "react";

/** Nastaví titulok a meta description pre konkrétnu podstránku (SPA). */
export const usePageTitle = (title: string, description?: string) => {
  useEffect(() => {
    document.title = title;
    if (description) {
      let el = document.querySelector('meta[name="description"]');
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", "description");
        document.head.appendChild(el);
      }
      el.setAttribute("content", description);
    }
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = `https://najkrajsipes.eu${window.location.pathname}`;
  }, [title, description]);
};
