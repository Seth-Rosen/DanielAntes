import { Config } from "@measured/puck";
import { HeroSection, TypesSection, ProjectsCarousel, PortfolioSection, StorySection, ContactSection } from "./site-components";

export type UserConfig = {
  HeroSection: {
    title: string;
    subtitle: string;
    backgroundImage?: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  TypesSection: {
    title: string;
    subtitle: string;
    types: Array<{
      name: string;
      subtitle: string;
      tag: string;
    }>;
  };
  ProjectsCarousel: {
    title: string;
    subtitle: string;
    featured?: boolean;
  };
  PortfolioSection: {
    title: string;
    subtitle: string;
    showFilters: boolean;
    availableTags: Array<{ value: string }>;
  };
  StorySection: {
    title: string;
    paragraphs: Array<{ value: string }>;
    experienceYears: string;
    ctaText: string;
  };
  ContactSection: {
    title: string;
    subtitle: string;
    phone: string;
    email: string;
    address: string;
  };
};

export const config: Config<UserConfig> = {
  components: {
    HeroSection: {
      fields: {
        title: { type: "text" },
        subtitle: { type: "textarea" },
        backgroundImage: { type: "text" },
        ctaPrimary: { type: "text" },
        ctaSecondary: { type: "text" },
      },
      defaultProps: {
        title: "Master Artisan\nMarquetry & Flooring",
        subtitle: "Crafting bespoke hardwood floors and intricate marquetry with three decades of artistic excellence",
        ctaPrimary: "View Portfolio",
        ctaSecondary: "Get In Touch",
      },
      render: HeroSection,
    },
    TypesSection: {
      fields: {
        title: { type: "text" },
        subtitle: { type: "textarea" },
        types: {
          type: "array",
          arrayFields: {
            name: { type: "text" },
            subtitle: { type: "text" },
            tag: { type: "text" },
          },
          defaultItemProps: {
            name: "Parquet",
            subtitle: "Classic geometric patterns",
            tag: "parquet",
          },
        },
      },
      defaultProps: {
        title: "Types of Marquetry",
        subtitle: "Each style represents decades of refined technique and artistic vision, creating floors that are both functional masterpieces and works of art.",
        types: [
          {
            name: "Parquet",
            subtitle: "Classic geometric patterns",
            tag: "parquet",
          },
          {
            name: "Medallion", 
            subtitle: "Circular masterpieces",
            tag: "medallion",
          },
          {
            name: "Mandala",
            subtitle: "Spiritual symmetry", 
            tag: "mandala",
          },
        ],
      },
      render: TypesSection,
    },
    ProjectsCarousel: {
      fields: {
        title: { type: "text" },
        subtitle: { type: "text" },
        featured: { type: "radio", options: [
          { label: "Featured Projects Only", value: true },
          { label: "All Projects", value: false },
        ]},
      },
      defaultProps: {
        title: "Featured Projects",
        subtitle: "Recent masterpieces showcasing artistic excellence",
        featured: true,
      },
      render: ProjectsCarousel,
    },
    PortfolioSection: {
      fields: {
        title: { type: "text" },
        subtitle: { type: "textarea" },
        showFilters: { type: "radio", options: [
          { label: "Show Filters", value: true },
          { label: "Hide Filters", value: false },
        ]},
        availableTags: {
          type: "array",
          arrayFields: {
            value: { type: "text" },
          },
          getItemSummary: (item: { value: string }) => item.value,
          defaultItemProps: {
            value: "parquet",
          },
        },
      },
      defaultProps: {
        title: "Portfolio",
        subtitle: "Explore our complete collection of bespoke marquetry and hardwood flooring projects",
        showFilters: true,
        availableTags: [
          { value: "parquet" },
          { value: "medallion" }, 
          { value: "mandala" },
        ],
      },
      render: PortfolioSection,
    },
    StorySection: {
      fields: {
        title: { type: "text" },
        paragraphs: {
          type: "array",
          arrayFields: {
            value: { type: "textarea" },
          },
          getItemSummary: (item: { value: string }) => item.value.substring(0, 50) + "...",
          defaultItemProps: {
            value: "Your story paragraph here...",
          },
        },
        experienceYears: { type: "text" },
        ctaText: { type: "text" },
      },
      defaultProps: {
        title: "My Story",
        paragraphs: [
          {
            value: "For over three decades, I've dedicated my life to the ancient art of marquetry and the precise craft of hardwood flooring. What began as an apprenticeship under master craftsmen in traditional European workshops has evolved into a passion for creating floors that are both functional and artistic.",
          },
          {
            value: "Each project represents a unique collaboration between client vision and artisan expertise. I believe that a floor should tell a story—whether through the sacred geometry of a mandala, the classical elegance of parquet, or the focal drama of a hand-crafted medallion.",
          },
          {
            value: "My commitment extends beyond individual projects to preserving these time-honored techniques for future generations, mentoring young craftspeople and contributing to industry resources that advance the field.",
          },
        ],
        experienceYears: "30+",
        ctaText: "Start Your Project",
      },
      render: StorySection,
    },
    ContactSection: {
      fields: {
        title: { type: "text" },
        subtitle: { type: "textarea" },
        phone: { type: "text" },
        email: { type: "text" },
        address: { type: "text" },
      },
      defaultProps: {
        title: "Start Your Project",
        subtitle: "Ready to create a masterpiece that will define your space for generations? Let's discuss your vision and bring it to life.",
        phone: "+1 (555) 123-4567",
        email: "daniel@marquetrymaster.com",
        address: "Available for on-site consultations",
      },
      render: ContactSection,
    },
  },
};
