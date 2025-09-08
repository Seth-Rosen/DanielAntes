import { useEffect, useState } from "react";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";

type SiteData = {
  heroTitle: string;
  heroSubtitle: string;
  story: string[];
  gallery: { src: string; alt?: string }[];
  heroImages?: { src: string; alt?: string }[];
  contact?: { email?: string; phone?: string };
};

export default function Home() {
  const [data, setData] = useState<SiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroSources = (data?.heroImages && data.heroImages.length ? data.heroImages : data?.gallery) || [];
  const heroImages = heroSources.map((g) => g.src);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/data/site.json?t=" + Date.now());
        if (res.ok) {
          const json = (await res.json()) as SiteData;
          setData(json);
        } else {
          setData(null);
        }
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (heroImages.length < 1) return;
    setCurrentSlide(0);
    const id = setInterval(() => {
      setCurrentSlide((s) => (s + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(id);
  }, [heroImages.length]);


  return (
    <div className="min-h-screen bg-background text-foreground" data-testid="home-page">
      <main className="pt-0">
        {/* Hero */}
        <section id="home" className="relative h-[70vh] flex items-center justify-center overflow-hidden">
          <a
            href="#home"
            className="absolute top-4 left-4 z-20 block"
            aria-label="Go to top"
          >
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F7a49fb9e5a3e44f68aecac27eea3cb74%2Face3d3af6f704e60afd7ecc1e12eb2af?format=webp&width=800"
              alt="Daniel Antes logo"
              className="h-28 md:h-32 lg:h-40 w-auto object-contain select-none drop-shadow-lg"
            />
          </a>
          <div className="absolute inset-0">
            {heroImages.length ? (
              <div className="absolute inset-0">
                {heroImages.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    aria-hidden={currentSlide !== i}
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
                    style={{ opacity: currentSlide === i ? 1 : 0 }}
                  />)
                )}
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-secondary to-muted" />
            )}
          </div>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
            <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 text-white" data-testid="hero-title">
              {(data?.heroTitle || "Daniel Antes").split("\n").map((l, i) => (
                <span key={i} className="block">{l}</span>
              ))}
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto" data-testid="hero-description">
              {data?.heroSubtitle || "Bespoke hardwood and marquetry"}
            </p>
            <div className="flex gap-4 justify-center">
              <a href="#gallery"><Button className="px-8 py-3 font-semibold">View Gallery</Button></a>
              <a href="#contact"><Button variant="outline" className="px-8 py-3 font-semibold">Get In Touch</Button></a>
            </div>
          </div>
          {heroImages.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
              {heroImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-2 w-2 rounded-full ${currentSlide === i ? 'bg-white' : 'bg-white/40'}`}
                />
              ))}
            </div>
          )}
        </section>

        {/* Story */}
        <section id="story" className="py-20 px-4 sm:px-6 lg:px-8 bg-background" data-testid="story-section">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6" data-testid="story-title">My Story</h2>
            {(data?.story || [
              "Add your story paragraphs in public/data/site.json.",
            ]).map((p, i) => (
              <p key={i} className="text-lg text-muted-foreground mb-6" data-testid={`story-paragraph-${i+1}`}>{p}</p>
            ))}
          </div>
        </section>

        {/* Gallery */}
        <section id="gallery" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted" data-testid="gallery-section">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-2">Gallery</h2>
            <p className="text-sm text-muted-foreground mb-8">Full gallery coming soon.</p>
            {loading ? (
              <div className="text-muted-foreground">Loading...</div>
            ) : (data?.gallery?.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.gallery.map((img, i) => (
                  <div key={i} className="overflow-hidden rounded-lg bg-card">
                    <img src={img.src} alt={img.alt || `image-${i}`} className="w-full h-64 object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground">Add images to public/uploads and list them in public/data/site.json.</div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-background" data-testid="contact-section">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">Start Your Project</h2>
            <p className="text-muted-foreground mb-6">Reach out to discuss your vision.</p>
            {data?.contact?.email && <p className="mb-2">Email: <a href={`mailto:${data.contact.email}`} className="underline">{data.contact.email}</a></p>}
            {data?.contact?.phone && <p>Phone: {data.contact.phone}</p>}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
