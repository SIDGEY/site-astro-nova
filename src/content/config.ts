import { defineCollection, z } from 'astro:content';

const seoSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  ogImage: z.string().optional(),
});

// --- Blocks Definition ---

const sectionVariantSchema = z.enum([
  'auto',
  'surface',
  'surface-2',
  'tint-coral',
  'tint-blue',
  'base',
  'alt',
  'highlight',
]);

const blockBaseSchema = z.object({
  bgVariant: sectionVariantSchema.optional(),
  variant: sectionVariantSchema.optional(),
});

const blockHeroSchema = blockBaseSchema.extend({
  type: z.literal('hero'),
  title: z.string(),
  subtitle: z.string().optional(),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  secondaryCtaText: z.string().optional(),
  secondaryCtaLink: z.string().optional(),
  cta: z.object({
    text: z.string(),
    link: z.string(),
  }).optional(),
  image: z.string().optional(),
});

const blockLogosSchema = blockBaseSchema.extend({
  type: z.literal('logos'),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  items: z.array(z.object({
    name: z.string(),
    image: z.string(),
  })).optional(),
  logos: z.array(z.object({
    name: z.string(),
    image: z.string(),
  })).optional(),
  image: z.string().optional(),
});

const blockBenefitsSchema = blockBaseSchema.extend({
  type: z.literal('benefits'),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  items: z.array(z.object({
    title: z.string(),
    text: z.string().optional(),
    description: z.string().optional(),
    icon: z.string().optional(),
    link: z.string().optional(),
    cta: z.string().optional(),
  })).optional(),
  image: z.string().optional(),
});

const blockStatsSchema = blockBaseSchema.extend({
  type: z.literal('stats'),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  items: z.array(z.object({
    label: z.string(),
    value: z.string(),
    suffix: z.string().optional(),
    description: z.string().optional(),
  })),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  image: z.string().optional(),
});

const blockStepsSchema = blockBaseSchema.extend({
  type: z.literal('steps'),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  items: z.array(z.object({
    title: z.string(),
    text: z.string(),
  })),
  image: z.string().optional(),
});

const blockWhySchema = blockBaseSchema.extend({
  type: z.literal('why'),
  whyTitle: z.string(),
  whyText: z.string(),
  whyBullets: z.array(z.string()),
});

const blockDeliverySchema = blockBaseSchema.extend({
  type: z.literal('delivery'),
  deliveryTitle: z.string(),
  deliveryText: z.string(),
  deliveryDeliverables: z.array(z.string()),
  deliveryCycle: z.array(z.object({
    title: z.string(),
    text: z.string(),
  })).optional(),
});

const blockEngagementModelsSchema = blockBaseSchema.extend({
  type: z.literal('engagementModels'),
  title: z.string().optional(),
  intro: z.string().optional(),
  engagementModels: z.array(z.object({
    title: z.string(),
    when: z.string(),
    benefit: z.string(),
  })),
});

const blockTestimonialsSchema = blockBaseSchema.extend({
  type: z.literal('testimonials'),
  title: z.string().optional(),
  items: z.array(z.object({
    quote: z.string(),
    author: z.string(),
    role: z.string().optional(),
    avatar: z.string().optional(),
  })),
  image: z.string().optional(),
});

const blockFaqSchema = blockBaseSchema.extend({
  type: z.literal('faq'),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  items: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })),
  image: z.string().optional(),
});

const blockRichContentSchema = blockBaseSchema.extend({
  type: z.literal('richContent'),
  content: z.string(),
});

const blockCtaSchema = blockBaseSchema.extend({
  type: z.literal('cta'),
  title: z.string(),
  subtitle: z.string().optional(),
  buttonText: z.string().optional(),
  buttonLink: z.string().optional(),
  footerText: z.string().optional(),
  cta: z.object({
    text: z.string(),
    link: z.string(),
  }).optional(),
});

const blockLeadFormSchema = blockBaseSchema.extend({
  type: z.literal('leadForm'),
  title: z.string(),
  subtitle: z.string().optional(),
  intro: z.string().optional(),
  submitLabel: z.string().default('Envoyer'),
  successMessage: z.string().default('Merci ! Votre demande a été transmise avec succès.'),
  hubspotFormType: z.enum(['diagnostic', 'contact', 'generic']).default('generic'),
});

const blockDiagnosticIASchema = blockBaseSchema.extend({
  type: z.literal('diagnosticIA'),
  title: z.string(),
  subtitle: z.string().optional(),
  items: z.array(z.string()).optional(),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  footerText: z.string().optional(),
});


const blockImageCardsSchema = blockBaseSchema.extend({
  type: z.literal('imageCards'),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  cards: z.array(z.object({
    title: z.string(),
    description: z.string().optional(),
    buttonLabel: z.string().optional(),
    buttonLink: z.string().optional(),
    image: z.string(),
    imageAlt: z.string().optional(),
  })),
});


const blockFeatureShowcaseSchema = blockBaseSchema.extend({
  type: z.literal('featureShowcase'),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  items: z.array(z.object({
    eyebrow: z.string().optional(),
    title: z.string(),
    description: z.string(),
    align: z.enum(['left', 'right']).default('left').optional(),
    backgroundImage: z.string(),
    backgroundImageAlt: z.string().optional(),
    screens: z.array(z.object({
      image: z.string(),
      imageAlt: z.string().optional(),
    })).optional(),
    tags: z.array(z.object({
      label: z.string().optional(),
      image: z.string().optional(),
      imageAlt: z.string().optional(),
    })).optional(),
    ctaLabel: z.string().optional(),
    ctaLink: z.string().optional(),
  })),
});

const blockCommercialsSchema = blockBaseSchema.extend({
  type: z.literal('commercials'),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  agencies: z.array(z.string()).optional(),
  expertises: z.array(z.string()).optional(),
  sectors: z.array(z.string()).optional(),
  selection: z.array(z.string()).optional(),
  ctaLabel: z.string().optional(),
  ctaLink: z.string().optional(),
});

// --- Astro Nova Game Blocks ---

const blockGameHeroSchema = blockBaseSchema.extend({
  type: z.literal('gameHero'),
  title: z.string(),
  subtitle: z.string(),
  ctaText: z.string(),
  ctaLink: z.string(),
  secondaryCtaText: z.string().optional(),
  secondaryCtaLink: z.string().optional(),
  screenshot1: z.string().optional(),
  screenshot2: z.string().optional(),
});

const blockGameFeaturesSchema = blockBaseSchema.extend({
  type: z.literal('gameFeatures'),
  title: z.string(),
  subtitle: z.string(),
  items: z.array(z.object({
    icon: z.string(),
    title: z.string(),
    description: z.string(),
  })),
});

const blockGameplaySchema = blockBaseSchema.extend({
  type: z.literal('gameplay'),
  title: z.string(),
  description: z.string(),
  secondaryDescription: z.string().optional(),
  image: z.string(),
  imageAlt: z.string(),
});

const blockCommunitySchema = blockBaseSchema.extend({
  type: z.literal('community'),
  title: z.string(),
  subtitle: z.string(),
  sectionTitle: z.string(),
  description: z.string(),
  secondaryDescription: z.string().optional(),
  discordLink: z.string(),
  discordButtonText: z.string().optional(),
  image: z.string(),
  imageAlt: z.string(),
});

const blockSchema = z.discriminatedUnion('type', [
  blockHeroSchema,
  blockLogosSchema,
  blockBenefitsSchema,
  blockStatsSchema,
  blockStepsSchema,
  blockWhySchema,
  blockDeliverySchema,
  blockEngagementModelsSchema,
  blockTestimonialsSchema,
  blockFaqSchema,
  blockRichContentSchema,
  blockCtaSchema,
  blockLeadFormSchema,
  blockDiagnosticIASchema,
  blockCommercialsSchema,
  // Astro Nova Game Blocks
  blockGameHeroSchema,
  blockGameFeaturesSchema,
  blockGameplaySchema,
  blockCommunitySchema,
  blockImageCardsSchema,
  blockFeatureShowcaseSchema,
]);


// --- Collections Definition ---

const settingsCollection = defineCollection({
  type: 'data',
  schema: z.object({
    siteName: z.string(),
    defaultDescription: z.string(),
    favicon: z.string().optional(),
    logo: z.string(),
    navigation: z.array(z.object({
      label: z.string(),
      link: z.string(),
    })),
    footer: z.object({
      value_proposition: z.object({
        title: z.string(),
        text: z.string(),
        bullets: z.array(z.string()).optional(),
      }).optional(),
      contact: z.object({
        title: z.string(),
        address: z.string().optional(),
        email: z.string(),
        phone: z.string(),
        cta_label: z.string(),
        cta_link: z.string(),
      }),
      section_titles: z.object({
        main_nav: z.string(),
        expertises: z.string(),
        agencies: z.string(),
        certifications: z.string(),
        resources: z.string(),
        social: z.string(),
      }),
      main_nav: z.array(z.object({
        label: z.string(),
        href: z.string(),
        type: z.enum(['internal', 'external']),
        aria_label: z.string().optional(),
      })),
      expertises_nav: z.array(z.object({
        label: z.string(),
        href: z.string(),
        type: z.enum(['internal', 'external']),
        aria_label: z.string().optional(),
      })),
      agencies_nav: z.array(z.object({
        label: z.string(),
        href: z.string(),
        type: z.enum(['internal', 'external']),
        aria_label: z.string().optional(),
      })),
      certifications: z.array(z.object({
        label: z.string(),
        href: z.string(),
        icon_filename: z.string(),
        type: z.enum(['internal', 'external']),
        aria_label: z.string().optional(),
      })),
      resources_nav: z.array(z.object({
        label: z.string(),
        href: z.string(),
        type: z.enum(['internal', 'external']),
        aria_label: z.string().optional(),
      })),
      social_nav: z.array(z.object({
        label: z.string(),
        href: z.string(),
        icon_filename: z.string().optional(),
        type: z.enum(['internal', 'external']),
        aria_label: z.string().optional(),
      })),
      copyright: z.object({
        text: z.string(),
      }),
    }),
  }),
});

const pagesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    blocks: z.array(blockSchema).optional(),
    sectionVariants: z.array(sectionVariantSchema).optional(),
    order: z.number().optional(),
    visibleInNav: z.boolean().optional(),
    updatedAt: z.union([z.date(), z.string()]).optional(),
    hero: z.object({
      title: z.string(),
      subtitle: z.string().optional(),
      cta: z.object({
        text: z.string(),
        link: z.string(),
      }).optional(),
    }).optional(),
    sections: z.array(z.any()).optional(),
  }),
});

const landingsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    blocks: z.array(blockSchema),
    sectionVariants: z.array(sectionVariantSchema).optional(),
  }),
});

const casesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    clientName: z.string(),
    sector: z.string(),
    summary: z.string(),
    problem: z.string(),
    solution: z.string(),
    results: z.array(z.object({
      label: z.string(),
      value: z.string(),
    })),
    stack: z.array(z.union([
      z.string(),
      z.object({
        name: z.string(),
      })
    ])),
    featured: z.boolean().default(false),
    date: z.coerce.date(),
    coverImage: z.string().optional(),
    sourceUrl: z.string().optional(),
    blocks: z.array(blockSchema).optional(),
    sectionVariants: z.array(sectionVariantSchema).optional(),
  }),
});

const articlesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    author: z.string(),
    coAuthors: z.array(z.string()),
    tags: z.array(z.string()),
    draft: z.boolean().default(false),
    image: z.string().optional(),
  }),
});

const agenciesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    city: z.string(),
    address: z.string(),
    phone: z.string(),
    email: z.string(),
    mapUrl: z.string().optional(),
    blocks: z.array(blockSchema).optional(),
    sectionVariants: z.array(sectionVariantSchema).optional(),
  }),
});

const commercialsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    firstName: z.string(),
    lastName: z.string(),
    role: z.string(),
    phone: z.string(),
    email: z.string(),
    photo: z.string(),
    agencies: z.array(z.string()),
    expertises: z.array(z.string()).optional(),
    sectors: z.array(z.string()).optional(),
    linkedin: z.string().optional(),
    bio: z.string().optional(),
  }),
});

export const collections = {
  'settings': settingsCollection,
  'pages': pagesCollection,
  'landings': landingsCollection,
};
