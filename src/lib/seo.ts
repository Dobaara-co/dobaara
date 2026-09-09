import { useEffect } from "react";

type Meta = {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
};

function setTag(attr: "property" | "name", key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

/** Sets per-page title and Open Graph / Twitter tags, restoring the defaults on unmount. */
export function usePageMeta({ title, description, image, url }: Meta) {
  useEffect(() => {
    const previousTitle = document.title;
    const previous: Record<string, string> = {};
    const remember = (attr: "property" | "name", key: string) => {
      const el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
      previous[`${attr}:${key}`] = el?.getAttribute("content") ?? "";
    };

    (["og:title", "og:description", "og:image", "og:url"] as const).forEach((k) =>
      remember("property", k)
    );
    (["description", "twitter:title", "twitter:description", "twitter:image"] as const).forEach(
      (k) => remember("name", k)
    );

    if (title) {
      document.title = title;
      setTag("property", "og:title", title);
      setTag("name", "twitter:title", title);
    }
    if (description) {
      setTag("name", "description", description);
      setTag("property", "og:description", description);
      setTag("name", "twitter:description", description);
    }
    if (image) {
      setTag("property", "og:image", image);
      setTag("name", "twitter:image", image);
    }
    if (url) setTag("property", "og:url", url);

    return () => {
      document.title = previousTitle;
      Object.entries(previous).forEach(([k, v]) => {
        if (!v) return;
        const [attr, ...rest] = k.split(":");
        setTag(attr as "property" | "name", rest.join(":"), v);
      });
    };
  }, [title, description, image, url]);
}
