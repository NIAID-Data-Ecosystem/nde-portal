/**
 * Accessibility tests for the Diseases route
 * (`src/pages/diseases/[[...slug]].tsx`).
 *
 * Strategy: run @axe-core/playwright WCAG 2.0/2.1 Level A + AA scans against the
 * rendered page. Every violation is attached to the HTML report, but only
 * `serious`/`critical` impacts FAIL the build (see e2e/utils/axe.ts and the
 * canonical repository-matcher.spec.ts).
 *
 * This single spec covers both shapes the catch-all route renders:
 *
 *   - The INDEX (`/diseases`, no slug) — `<TableOfContents>`. `getStaticProps`
 *     returns `{ slug: [], data: null }` for the index WITHOUT any server fetch,
 *     so the index is driven entirely by the client-side `['diseases']` query
 *     (`fetchAllDiseasePages` → `**\/api/diseases*`), which `page.route` mocks
 *     deterministically. Loading / empty / populated / error are all reachable.
 *
 *   - A DISEASE PAGE (`/diseases/<slug>`) — `<DiseaseContent>`: the intro header
 *     plus the four data visualizations (treemap/brushable list, data-types
 *     donut, sources bar chart, conditions-of-access stacked bar). The page body
 *     is gated on `hasSlug` (from `props.slug`), and `getStaticProps` calls
 *     `fetchDiseaseBySlug` SERVER-SIDE (out of reach of `page.route`); on failure
 *     it returns `notFound`, so the route must be a REAL published slug or the
 *     dev server 404s before React renders. As in about.spec.ts /
 *     knowledge-center.spec.ts, we navigate a real slug (`asthma`) so the dev
 *     server seeds `props.data`, then mock the CLIENT-side refetch
 *     (`**\/api/diseases*`) and the chart APIs with fixtures, and wait for
 *     fixture-only proof (a distinctive subtitle and a distinctive total count)
 *     so the mocks — not the SSR seed — own the DOM we scan.
 *
 * Endpoints mocked (all client-side, all interceptable):
 *   - `**\/api/diseases*` — Strapi CMS. The index list (`fetchAllDiseasePages`)
 *     AND the disease-page refetch (`fetchDiseaseBySlug`). A 5xx here surfaces an
 *     error on both shapes.
 *   - `**\/query*` — NDE API. The total-count query plus every chart
 *     (`fetchSearchResults`). A single superset-facets fixture serves all of
 *     them: each chart's `select` reads only the facet key it needs.
 *   - `**\/metadata*` — NDE API. Source metadata for the Sources bar chart
 *     (`fetchMetadata`).
 *
 * MDX components note (answers the brief's "extract mdx specs?" question):
 *   The disease pages render markdown through `useMDXComponents` →
 *   `src/components/mdx/components`, the SAME component set already exercised
 *   end-to-end by the deliberately MDX-rich fixture in knowledge-center.spec.ts
 *   (anchored headings, callouts, figures, video, lists, code, details, etc.).
 *   The diseases copy (intro description + chart descriptions in
 *   disease-page.json) only uses a small subset — paragraphs, emphasis, and
 *   links — which this spec scans as it actually renders. We deliberately do NOT
 *   add a second full MDX-showcase fixture here: that matrix lives in
 *   knowledge-center.spec.ts and duplicating it would be redundant, not safer.
 *
 * State-coverage notes:
 *   - The disease page has no reachable "no h1 / loading skeleton for the whole
 *     page" frame: `getStaticProps` seeds `initialData`, so the disease query is
 *     never `isLoading` and the intro renders immediately. Its meaningful loading
 *     state is the CHARTS loading (their `**\/query*`/`**\/metadata*` queries have
 *     no seed), scanned by holding those requests pending while the intro renders.
 *   - The disease ERROR state has no `<h1>` — the shared `<Error>` block renders
 *     an `<h2>` ("Something went wrong.") with no page title — so that scan
 *     asserts the error heading instead of an h1. (axe's `page-has-heading-one`
 *     is best-practice/moderate and does not block; the missing h1 on the error
 *     page is a pre-existing minor gap, out of scope here.)
 */
import AxeBuilder from '@axe-core/playwright';
import { test, expect, type Page, type TestInfo } from '@playwright/test';
import {
  analyzeA11y,
  attachA11yReport,
  attachScreenshot,
  blockingViolations,
  formatViolations,
  WCAG_AA_TAGS,
} from '../utils/axe';

// --- Per-route configuration -------------------------------------------------

const INDEX_ROUTE = '/diseases';

// A real, published disease slug. `getStaticProps` fetches it server-side so the
// page renders instead of 404ing; the client-side refetch is then mocked below,
// so the rendered body is our fixture, not the live record.
const DISEASE_SLUG = 'asthma';
const DISEASE_ROUTE = `/diseases/${DISEASE_SLUG}`;

const DISEASES_GLOB = '**/api/diseases*'; // Strapi: index list + disease refetch
const QUERY_GLOB = '**/query*'; // NDE: total count + every chart
const METADATA_GLOB = '**/metadata*'; // NDE: source metadata for Sources chart

const ISO = '2025-02-22T19:09:45.049Z';

// A distinctive subtitle so waiting on it proves the CLIENT mock — not the
// getStaticProps seed — owns the disease-page DOM we scan.
const DISEASE_SUBTITLE = 'A11y fixture — disease subtitle';

// Total used for the charts heading ("125,125 Asthma Related Resources"). The
// total-count query has no seed (no initialData/placeholderData), so this value
// can only come from the mocked `**/query*` response — waiting on the rendered
// count proves the mock owns the DOM.
const TOTAL_COUNT = 125125;
const TOTAL_COUNT_LABEL = TOTAL_COUNT.toLocaleString(); // "125,125"

// Strapi collection payload for a single disease. `fetchDiseaseBySlug` reads
// `data[0]`; `withtopicEmphasizedDescription` derives the rendered description.
const DISEASE_FIXTURE = {
  data: [
    {
      id: 3,
      documentId: 'l1hpzejr12adivzgezi34bso',
      title: 'Asthma',
      topic: 'asthma',
      slug: 'asthma',
      query: {
        q: '"Asthma"',
        size: 0,
        facet_size: 1000,
      },
      subtitle: DISEASE_SUBTITLE,
      description:
        'Asthma is a chronic lung disease characterized by episodes of airway narrowing and obstruction, causing wheezing, coughing, chest tightness and shortness of breath. [Learn more about NIAID’s efforts to address this disease.](https://www.niaid.nih.gov/diseases-conditions/asthma)',
      createdAt: '2025-07-29T20:54:33.647Z',
      updatedAt: '2026-04-01T18:04:36.199Z',
      publishedAt: null,
      image: {
        id: 128,
        name: 'asthma-hero_1.jpg',
        alternativeText: 'Photo of a smog covered cityscape',
        caption:
          'Smog-covered city skyline illustrating poor air quality. Credit: NIAID.',
        width: 306,
        height: 238,
        formats: {
          thumbnail: {
            ext: '.jpg',
            url: '/uploads/thumbnail_asthma_hero_1_95f736445b.jpg',
            hash: 'thumbnail_asthma_hero_1_95f736445b',
            mime: 'image/jpeg',
            name: 'thumbnail_asthma-hero_1.jpg',
            path: null,
            size: 6.31,
            width: 201,
            height: 156,
            sizeInBytes: 6313,
          },
        },
        hash: 'asthma_hero_1_95f736445b',
        ext: '.jpg',
        mime: 'image/jpeg',
        size: 11.71,
        url: '/uploads/asthma_hero_1_95f736445b.jpg',
        previewUrl: null,
        provider: 'local',
        provider_metadata: null,
        createdAt: '2025-07-29T17:52:45.527Z',
        updatedAt: '2025-07-29T20:50:11.315Z',
        documentId: 'ultwugqy134ah84emmxb987f',
        publishedAt: '2025-07-29T17:52:45.528Z',
      },
      contacts: [],
      externalLinks: [
        {
          id: 24,
          label: 'National Institute of Allergy and Infectious Diseases',
          url: 'https://www.niaid.nih.gov/',
          isExternal: true,
          image: {
            id: 129,
            name: 'NIH-logo.png',
            alternativeText: 'nih logo',
            caption: null,
            width: 336,
            height: 319,
            formats: {
              thumbnail: {
                ext: '.png',
                url: '/uploads/thumbnail_NIH_logo_cb2bcdf23a.png',
                hash: 'thumbnail_NIH_logo_cb2bcdf23a',
                mime: 'image/png',
                name: 'thumbnail_NIH-logo.png',
                path: null,
                size: 10.65,
                width: 164,
                height: 156,
                sizeInBytes: 10649,
              },
            },
            hash: 'NIH_logo_cb2bcdf23a',
            ext: '.png',
            mime: 'image/png',
            size: 3.48,
            url: '/uploads/NIH_logo_cb2bcdf23a.png',
            previewUrl: null,
            provider: 'local',
            provider_metadata: null,
            createdAt: '2025-07-29T17:59:40.818Z',
            updatedAt: '2026-01-29T00:37:52.457Z',
            documentId: 'hyao5m6ncauxkp1aspqadwe1',
            publishedAt: '2025-07-29T17:59:40.820Z',
          },
          categories: [],
        },
        {
          id: 25,
          label: 'NIAID Clinical Trials: Asthma Studies',
          url: 'https://www.niaid.nih.gov/clinical-trials/asthma-studies',
          isExternal: true,
          image: null,
          categories: [],
        },
        {
          id: 26,
          label: 'CDC Asthma',
          url: 'https://www.cdc.gov/asthma/index.html',
          isExternal: true,
          image: null,
          categories: [],
        },
        {
          id: 27,
          label: 'Childhood Asthma in Urban Settings (CAUSE)',
          url: 'https://www.niaid.nih.gov/research/childhood-asthma-in-urban-settings',
          isExternal: true,
          image: null,
          categories: [
            {
              id: 1,
              name: 'Working Groups / Programs / Networks',
              url: null,
              description: null,
              createdAt: '2025-07-29T17:56:24.338Z',
              updatedAt: '2025-08-01T14:31:47.761Z',
              publishedAt: null,
              documentId: 'iho4858lbfs6jwoxmckv85nw',
            },
          ],
        },
        {
          id: 28,
          label:
            'Asthma and Allergic Diseases Cooperative Research Centers (AADCRCs)',
          url: 'https://www.niaid.nih.gov/research/cooperative-research-centers',
          isExternal: true,
          image: null,
          categories: [
            {
              id: 1,
              name: 'Working Groups / Programs / Networks',
              url: null,
              description: null,
              createdAt: '2025-07-29T17:56:24.338Z',
              updatedAt: '2025-08-01T14:31:47.761Z',
              publishedAt: null,
              documentId: 'iho4858lbfs6jwoxmckv85nw',
            },
          ],
        },
        {
          id: 29,
          label: 'Immune Tolerance Network (ITN)',
          url: 'https://www.niaid.nih.gov/research/immune-tolerance-network',
          isExternal: true,
          image: null,
          categories: [
            {
              id: 1,
              name: 'Working Groups / Programs / Networks',
              url: null,
              description: null,
              createdAt: '2025-07-29T17:56:24.338Z',
              updatedAt: '2025-08-01T14:31:47.761Z',
              publishedAt: null,
              documentId: 'iho4858lbfs6jwoxmckv85nw',
            },
          ],
        },
        {
          id: 30,
          label: 'Human Immunology Project Consortium (HIPC)',
          url: 'https://www.niaid.nih.gov/research/human-immunology-project-consortium',
          isExternal: true,
          image: null,
          categories: [
            {
              id: 1,
              name: 'Working Groups / Programs / Networks',
              url: null,
              description: null,
              createdAt: '2025-07-29T17:56:24.338Z',
              updatedAt: '2025-08-01T14:31:47.761Z',
              publishedAt: null,
              documentId: 'iho4858lbfs6jwoxmckv85nw',
            },
          ],
        },
      ],
      topicEmphasizedDescription:
        '*Asthma* is a chronic lung disease characterized by episodes of airway narrowing and obstruction, causing wheezing, coughing, chest tightness and shortness of breath. [Learn more about NIAID’s efforts to address this disease.](https://www.niaid.nih.gov/diseases-conditions/*asthma*)',
    },
  ],
  meta: {},
};

// Strapi collection payload for the index list (a few diseases → a few cards).
const DISEASE_LIST_FIXTURE = {
  data: [
    {
      id: 3,
      documentId: 'l1hpzejr12adivzgezi34bso',
      title: 'Asthma',
      topic: 'asthma',
      slug: 'asthma',
      query: {
        q: '"Asthma"',
        size: 0,
        facet_size: 1000,
      },
      subtitle: DISEASE_SUBTITLE,
      description:
        'Asthma is a chronic lung disease characterized by episodes of airway narrowing and obstruction, causing wheezing, coughing, chest tightness and shortness of breath. [Learn more about NIAID’s efforts to address this disease.](https://www.niaid.nih.gov/diseases-conditions/asthma)',
      createdAt: '2025-07-29T20:54:33.647Z',
      updatedAt: '2026-04-01T18:04:36.199Z',
      publishedAt: null,
      image: {
        id: 128,
        name: 'asthma-hero_1.jpg',
        alternativeText: 'Photo of a smog covered cityscape',
        caption:
          'Smog-covered city skyline illustrating poor air quality. Credit: NIAID.',
        width: 306,
        height: 238,
        formats: {
          thumbnail: {
            ext: '.jpg',
            url: '/uploads/thumbnail_asthma_hero_1_95f736445b.jpg',
            hash: 'thumbnail_asthma_hero_1_95f736445b',
            mime: 'image/jpeg',
            name: 'thumbnail_asthma-hero_1.jpg',
            path: null,
            size: 6.31,
            width: 201,
            height: 156,
            sizeInBytes: 6313,
          },
        },
        hash: 'asthma_hero_1_95f736445b',
        ext: '.jpg',
        mime: 'image/jpeg',
        size: 11.71,
        url: '/uploads/asthma_hero_1_95f736445b.jpg',
        previewUrl: null,
        provider: 'local',
        provider_metadata: null,
        createdAt: '2025-07-29T17:52:45.527Z',
        updatedAt: '2025-07-29T20:50:11.315Z',
        documentId: 'ultwugqy134ah84emmxb987f',
        publishedAt: '2025-07-29T17:52:45.528Z',
      },
      contacts: [],
      externalLinks: [
        {
          id: 24,
          label: 'National Institute of Allergy and Infectious Diseases',
          url: 'https://www.niaid.nih.gov/',
          isExternal: true,
          image: {
            id: 129,
            name: 'NIH-logo.png',
            alternativeText: 'nih logo',
            caption: null,
            width: 336,
            height: 319,
            formats: {
              thumbnail: {
                ext: '.png',
                url: '/uploads/thumbnail_NIH_logo_cb2bcdf23a.png',
                hash: 'thumbnail_NIH_logo_cb2bcdf23a',
                mime: 'image/png',
                name: 'thumbnail_NIH-logo.png',
                path: null,
                size: 10.65,
                width: 164,
                height: 156,
                sizeInBytes: 10649,
              },
            },
            hash: 'NIH_logo_cb2bcdf23a',
            ext: '.png',
            mime: 'image/png',
            size: 3.48,
            url: '/uploads/NIH_logo_cb2bcdf23a.png',
            previewUrl: null,
            provider: 'local',
            provider_metadata: null,
            createdAt: '2025-07-29T17:59:40.818Z',
            updatedAt: '2026-01-29T00:37:52.457Z',
            documentId: 'hyao5m6ncauxkp1aspqadwe1',
            publishedAt: '2025-07-29T17:59:40.820Z',
          },
          categories: [],
        },
        {
          id: 25,
          label: 'NIAID Clinical Trials: Asthma Studies',
          url: 'https://www.niaid.nih.gov/clinical-trials/asthma-studies',
          isExternal: true,
          image: null,
          categories: [],
        },
        {
          id: 26,
          label: 'CDC Asthma',
          url: 'https://www.cdc.gov/asthma/index.html',
          isExternal: true,
          image: null,
          categories: [],
        },
        {
          id: 27,
          label: 'Childhood Asthma in Urban Settings (CAUSE)',
          url: 'https://www.niaid.nih.gov/research/childhood-asthma-in-urban-settings',
          isExternal: true,
          image: null,
          categories: [
            {
              id: 1,
              name: 'Working Groups / Programs / Networks',
              url: null,
              description: null,
              createdAt: '2025-07-29T17:56:24.338Z',
              updatedAt: '2025-08-01T14:31:47.761Z',
              publishedAt: null,
              documentId: 'iho4858lbfs6jwoxmckv85nw',
            },
          ],
        },
        {
          id: 28,
          label:
            'Asthma and Allergic Diseases Cooperative Research Centers (AADCRCs)',
          url: 'https://www.niaid.nih.gov/research/cooperative-research-centers',
          isExternal: true,
          image: null,
          categories: [
            {
              id: 1,
              name: 'Working Groups / Programs / Networks',
              url: null,
              description: null,
              createdAt: '2025-07-29T17:56:24.338Z',
              updatedAt: '2025-08-01T14:31:47.761Z',
              publishedAt: null,
              documentId: 'iho4858lbfs6jwoxmckv85nw',
            },
          ],
        },
        {
          id: 29,
          label: 'Immune Tolerance Network (ITN)',
          url: 'https://www.niaid.nih.gov/research/immune-tolerance-network',
          isExternal: true,
          image: null,
          categories: [
            {
              id: 1,
              name: 'Working Groups / Programs / Networks',
              url: null,
              description: null,
              createdAt: '2025-07-29T17:56:24.338Z',
              updatedAt: '2025-08-01T14:31:47.761Z',
              publishedAt: null,
              documentId: 'iho4858lbfs6jwoxmckv85nw',
            },
          ],
        },
        {
          id: 30,
          label: 'Human Immunology Project Consortium (HIPC)',
          url: 'https://www.niaid.nih.gov/research/human-immunology-project-consortium',
          isExternal: true,
          image: null,
          categories: [
            {
              id: 1,
              name: 'Working Groups / Programs / Networks',
              url: null,
              description: null,
              createdAt: '2025-07-29T17:56:24.338Z',
              updatedAt: '2025-08-01T14:31:47.761Z',
              publishedAt: null,
              documentId: 'iho4858lbfs6jwoxmckv85nw',
            },
          ],
        },
      ],
      topicEmphasizedDescription:
        '*Asthma* is a chronic lung disease characterized by episodes of airway narrowing and obstruction, causing wheezing, coughing, chest tightness and shortness of breath. [Learn more about NIAID’s efforts to address this disease.](https://www.niaid.nih.gov/diseases-conditions/*asthma*)',
    },
    {
      id: 4,
      documentId: 'b1tjbvhttr2043tfvay9c7ro',
      title: 'Influenza',
      topic: 'influenza',
      slug: 'influenza',
      query: {
        q: '"Influenza" OR "Flu"',
        size: 0,
        facet_size: 1000,
      },
      subtitle: DISEASE_SUBTITLE,
      description:
        'Each year, influenza causes millions of illnesses worldwide and, in the United States, results in thousands of hospitalizations and deaths. Influenza is especially dangerous for people 65 years and older, young children and people with certain health conditions, such as heart disease or asthma. Research to find new and improved ways to diagnose, treat and prevent seasonal influenza and novel influenza viruses with pandemic potential is essential to protecting the public health. [Learn more about NIAID’s efforts to address this disease.](https://www.niaid.nih.gov/diseases-conditions/influenza)',
      createdAt: '2025-07-29T21:10:22.440Z',
      updatedAt: '2025-08-04T14:39:48.492Z',
      publishedAt: null,
      image: {
        id: 131,
        name: 'avian-flu-hero_0.jpg',
        alternativeText: 'Influenza A (H5N1) virus particles (rod shaped)',
        caption:
          'Rod-shaped Influenza A (H5N1) virus particles. Credit: NIAID.',
        width: 306,
        height: 238,
        formats: {
          thumbnail: {
            ext: '.jpg',
            url: '/uploads/thumbnail_avian_flu_hero_0_87befe6bf9.jpg',
            hash: 'thumbnail_avian_flu_hero_0_87befe6bf9',
            mime: 'image/jpeg',
            name: 'thumbnail_avian-flu-hero_0.jpg',
            path: null,
            size: 6.42,
            width: 201,
            height: 156,
            sizeInBytes: 6420,
          },
        },
        hash: 'avian_flu_hero_0_87befe6bf9',
        ext: '.jpg',
        mime: 'image/jpeg',
        size: 12.15,
        url: '/uploads/avian_flu_hero_0_87befe6bf9.jpg',
        previewUrl: null,
        provider: 'local',
        provider_metadata: null,
        createdAt: '2025-07-29T21:04:58.475Z',
        updatedAt: '2025-07-29T21:04:58.475Z',
        documentId: 'op8sle0vc4qlk54abvvqwf7b',
        publishedAt: '2025-07-29T21:04:58.477Z',
      },
      contacts: [],
      externalLinks: [
        {
          id: 31,
          label: 'National Institute of Allergy and Infectious Diseases',
          url: 'https://www.niaid.nih.gov/',
          isExternal: true,
          image: {
            id: 129,
            name: 'NIH-logo.png',
            alternativeText: 'nih logo',
            caption: null,
            width: 336,
            height: 319,
            formats: {
              thumbnail: {
                ext: '.png',
                url: '/uploads/thumbnail_NIH_logo_cb2bcdf23a.png',
                hash: 'thumbnail_NIH_logo_cb2bcdf23a',
                mime: 'image/png',
                name: 'thumbnail_NIH-logo.png',
                path: null,
                size: 10.65,
                width: 164,
                height: 156,
                sizeInBytes: 10649,
              },
            },
            hash: 'NIH_logo_cb2bcdf23a',
            ext: '.png',
            mime: 'image/png',
            size: 3.48,
            url: '/uploads/NIH_logo_cb2bcdf23a.png',
            previewUrl: null,
            provider: 'local',
            provider_metadata: null,
            createdAt: '2025-07-29T17:59:40.818Z',
            updatedAt: '2026-01-29T00:37:52.457Z',
            documentId: 'hyao5m6ncauxkp1aspqadwe1',
            publishedAt: '2025-07-29T17:59:40.820Z',
          },
          categories: [],
        },
        {
          id: 32,
          label: 'CDC Influenza (Flu)',
          url: 'https://www.cdc.gov/flu/index.html',
          isExternal: true,
          image: null,
          categories: [],
        },
        {
          id: 33,
          label:
            'Centers of Excellence for Influenza Research and Response (CEIRR)',
          url: 'https://www.niaid.nih.gov/research/centers-excellence-influenza-research-response',
          isExternal: true,
          image: null,
          categories: [
            {
              id: 1,
              name: 'Working Groups / Programs / Networks',
              url: null,
              description: null,
              createdAt: '2025-07-29T17:56:24.338Z',
              updatedAt: '2025-08-01T14:31:47.761Z',
              publishedAt: null,
              documentId: 'iho4858lbfs6jwoxmckv85nw',
            },
          ],
        },
        {
          id: 34,
          label: 'Collaborative Influenza Vaccine Innovation Centers (CIVICs)',
          url: 'https://www.niaid.nih.gov/research/civics',
          isExternal: true,
          image: null,
          categories: [
            {
              id: 1,
              name: 'Working Groups / Programs / Networks',
              url: null,
              description: null,
              createdAt: '2025-07-29T17:56:24.338Z',
              updatedAt: '2025-08-01T14:31:47.761Z',
              publishedAt: null,
              documentId: 'iho4858lbfs6jwoxmckv85nw',
            },
          ],
        },
        {
          id: 35,
          label:
            'Mexican Emerging Infectious Disease Clinical Research Network (LaRed)',
          url: 'https://www.niaid.nih.gov/research/lared',
          isExternal: true,
          image: null,
          categories: [
            {
              id: 1,
              name: 'Working Groups / Programs / Networks',
              url: null,
              description: null,
              createdAt: '2025-07-29T17:56:24.338Z',
              updatedAt: '2025-08-01T14:31:47.761Z',
              publishedAt: null,
              documentId: 'iho4858lbfs6jwoxmckv85nw',
            },
          ],
        },
        {
          id: 36,
          label: 'Modeling Immunity for Biodefense (MIB)',
          url: 'https://www.niaid.nih.gov/research/modeling-immunity-biodefense',
          isExternal: true,
          image: null,
          categories: [
            {
              id: 1,
              name: 'Working Groups / Programs / Networks',
              url: null,
              description: null,
              createdAt: '2025-07-29T17:56:24.338Z',
              updatedAt: '2025-08-01T14:31:47.761Z',
              publishedAt: null,
              documentId: 'iho4858lbfs6jwoxmckv85nw',
            },
          ],
        },
        {
          id: 37,
          label: 'Infectious Diseases Clinical Research Consortium',
          url: 'https://www.niaid.nih.gov/research/idcrc',
          isExternal: true,
          image: null,
          categories: [
            {
              id: 1,
              name: 'Working Groups / Programs / Networks',
              url: null,
              description: null,
              createdAt: '2025-07-29T17:56:24.338Z',
              updatedAt: '2025-08-01T14:31:47.761Z',
              publishedAt: null,
              documentId: 'iho4858lbfs6jwoxmckv85nw',
            },
          ],
        },
        {
          id: 38,
          label: 'ClinicalTrials.gov',
          url: 'https://clinicaltrials.gov/search?cond=Influenza&aggFilters=funderType:nih',
          isExternal: true,
          image: null,
          categories: [],
        },
      ],
      topicEmphasizedDescription:
        'Each year, *influenza* causes millions of illnesses worldwide and, in the United States, results in thousands of hospitalizations and deaths. *Influenza* is especially dangerous for people 65 years and older, young children and people with certain health conditions, such as heart disease or asthma. Research to find new and improved ways to diagnose, treat and prevent seasonal *influenza* and novel *influenza* viruses with pandemic potential is essential to protecting the public health. [Learn more about NIAID’s efforts to address this disease.](https://www.niaid.nih.gov/diseases-conditions/*influenza*)',
    },
  ],
  meta: {},
};

const EMPTY_DISEASES_FIXTURE = { data: [], meta: {} };

// NDE `/query` response. `fetchSearchResults` maps `hits` → results (empty here)
// and passes `facets`/`total` through. One superset of facet keys feeds every
// chart: each chart's `select` picks only the key it requested. Term lists are
// representative excerpts of real `asthma` API responses (trimmed for size) so
// the visualizations render realistic shapes for the scan.
const mkFacet = (terms: { term: string; count: number }[]) => ({
  _type: 'terms',
  missing: 0,
  other: 0,
  total: TOTAL_COUNT,
  terms,
});
const QUERY_FIXTURE = {
  hits: [],
  total: TOTAL_COUNT,
  facets: {
    // Data-types donut + legend (DataTypes).
    '@type': mkFacet([
      { term: 'Sample', count: 114117 },
      { term: 'Dataset', count: 10996 },
      { term: 'ComputationalTool', count: 7 },
      { term: 'DataCollection', count: 3 },
      { term: 'ResourceCatalog', count: 2 },
    ]),
    // Conditions-of-access stacked bar (ConditionsOfAccess).
    conditionsOfAccess: mkFacet([
      { term: 'Unknown', count: 110248 },
      { term: 'Open', count: 13680 },
      { term: 'Restricted', count: 900 },
      { term: 'Controlled', count: 297 },
    ]),
    // Treemap / brushable list (PropertyTreemapLists) — three facets.
    'healthCondition.name': mkFacet([
      { term: 'asthma', count: 35973 },
      { term: 'obesity disorder', count: 1124 },
      { term: 'hepatic encephalopathy', count: 809 },
      { term: 'diabetes mellitus', count: 589 },
      { term: 'chronic obstructive pulmonary disease', count: 563 },
      { term: 'hypertensive disorder', count: 506 },
      { term: 'status asthmaticus', count: 478 },
      { term: 'rheumatoid arthritis', count: 470 },
      { term: 'drug allergy', count: 433 },
      { term: 'healthy', count: 357 },
      { term: 'osteoarthritis', count: 314 },
      { term: 'atopic eczema', count: 310 },
      { term: 'severe acute respiratory syndrome', count: 308 },
      { term: 'allergic rhinitis', count: 269 },
      { term: 'covid-19', count: 256 },
    ]),
    'measurementTechnique.name': mkFacet([
      { term: 'rna-seq', count: 5087 },
      { term: 'cdna', count: 5079 },
      { term: 'nextseq 500', count: 3440 },
      { term: 'sequencing assay', count: 1033 },
      { term: 'clinical study', count: 897 },
      { term: 'illumina 16s', count: 793 },
      { term: 'assay by high throughput sequencer', count: 770 },
      { term: 'high-throughput expression assay', count: 676 },
      { term: 'illumina miseq', count: 591 },
      { term: 'rna-seq assay', count: 518 },
      { term: 'size fractionation', count: 479 },
      { term: 'assay by array', count: 464 },
      { term: 'mirna-seq', count: 451 },
      { term: 'expression assay', count: 428 },
      { term: 'microarray assay', count: 294 },
    ]),
    'infectiousAgent.name': mkFacet([
      { term: 'human gut metagenome', count: 5781 },
      { term: 'metagenome', count: 3090 },
      { term: 'homo sapiens', count: 2651 },
      { term: 'human skin metagenome', count: 2194 },
      { term: 'human oral metagenome', count: 1864 },
      { term: 'amplicaria', count: 360 },
      { term: 'fungus metagenome', count: 284 },
      { term: 'human', count: 279 },
      { term: 'bacillus sp. ts2', count: 128 },
      { term: 'air metagenome', count: 90 },
      { term: 'mouse gut metagenome', count: 80 },
      { term: 'human sputum metagenome', count: 78 },
      { term: 'lung metagenome', count: 67 },
      { term: 'human nasopharyngeal metagenome', count: 65 },
      { term: 'human metagenome', count: 62 },
    ]),
    // Sources requests `multi_terms_fields=includedInDataCatalog.name,@type`, so
    // its facet key is `multi_terms_agg` with `identifier|type` terms; the chart
    // splits the term on `|` and joins each to METADATA_FIXTURE by identifier.
    multi_terms_agg: mkFacet([
      { term: 'BioSample|Sample', count: 98672 },
      { term: 'NCBI GEO|Sample', count: 16103 },
      { term: 'Figshare|Dataset', count: 4984 },
      { term: 'NCBI BioProject|Dataset', count: 1483 },
      { term: 'NICHD DASH|Dataset', count: 900 },
      { term: 'NCBI SRA|Dataset', count: 820 },
      { term: 'USIDNET|Sample', count: 433 },
      { term: 'Vivli|Dataset', count: 416 },
      { term: 'Zenodo|Dataset', count: 245 },
      { term: 'Omics Discovery Index (OmicsDI)|Dataset', count: 221 },
      { term: 'BacDive|Sample', count: 152 },
      { term: 'BioStudies|Dataset', count: 146 },
    ]),
  },
};

// NDE `/metadata` response. The Sources chart reads `.src` and joins each
// repository to its `sourceInfo` by `identifier`. A representative subset is
// enough; sources with no entry here render with `info: null` (matches prod).
const mkSource = (identifier: string, name: string, abstract: string) => ({
  sourceInfo: {
    identifier,
    name,
    abstract,
    genre: ['Generalist'],
    description: abstract,
  },
});
const METADATA_FIXTURE = {
  src: {
    biosample: mkSource(
      'BioSample',
      'BioSample',
      'NCBI BioSample is a NIH supported generalist repository that includes other data.',
    ),
    ncbi_geo: mkSource(
      'NCBI GEO',
      'NCBI GEO',
      'Gene Expression Omnibus (GEO) is an NIH supported repository for high-throughput functional genomics data.',
    ),
    figshare: mkSource(
      'Figshare',
      'Figshare',
      'Figshare is a NIH supported generalist repository that includes generalist data.',
    ),
    ncbi_bioproject: mkSource(
      'NCBI BioProject',
      'NCBI BioProject',
      'NCBI BioProject is a NIH supported generalist repository that includes multiomic data.',
    ),
    ncbi_sra: mkSource(
      'NCBI SRA',
      'NCBI SRA',
      'Sequence Read Archive (SRA) is the largest publicly available repository of high throughput sequencing data.',
    ),
    zenodo: mkSource(
      'Zenodo',
      'Zenodo',
      'Zenodo is a GREI repository that includes most data types and domains.',
    ),
  },
};

const fulfillJson = (body: unknown) => ({
  status: 200,
  contentType: 'application/json',
  body: JSON.stringify(body),
});

const fail500 = (route: import('@playwright/test').Route) =>
  route.fulfill({
    status: 500,
    contentType: 'application/json',
    body: JSON.stringify({ error: 'Internal Server Error' }),
  });

// --- Shared axe scans --------------------------------------------------------

/**
 * The axe scans every state runs: a full WCAG A/AA scan, a focused
 * color-contrast scan, and a focused button/link-name scan, each reported
 * separately, plus a screenshot. Kept separate from the per-state structural
 * assertions because the disease shapes vary (the error state has no h1, the
 * disease page has no on-page form), so each describe block asserts its own
 * landmarks/headings/forms and then calls this.
 */
async function runAxeScans(page: Page, testInfo: TestInfo, state: string) {
  // Full-page WCAG A/AA scan. WCAG_AA_TAGS already includes color-contrast and
  // the landmark/heading-order best-practice rules, so this is the backbone.
  const results = await analyzeA11y(page);
  await attachA11yReport(testInfo, state, results.violations);

  const blocking = blockingViolations(results.violations);
  expect(
    blocking,
    `Serious/critical accessibility violations found:\n${formatViolations(
      blocking,
    )}`,
  ).toEqual([]);

  // Focused color-contrast scan, reported separately for easy triage. No helper
  // exists for this — run the single rule inline, matching the canonical spec.
  const contrast = await new AxeBuilder({ page })
    .withTags(WCAG_AA_TAGS)
    .options({ runOnly: { type: 'rule', values: ['color-contrast'] } })
    .analyze();
  await attachA11yReport(testInfo, `${state} — contrast`, contrast.violations);

  const blockingContrast = blockingViolations(contrast.violations);
  expect(
    blockingContrast,
    `Color-contrast violations found:\n${formatViolations(blockingContrast)}`,
  ).toEqual([]);

  // Buttons/links: every button/link must expose an accessible name. axe's
  // `button-name`/`link-name` rules cover aria-label, text content, titled
  // icons, etc., so we delegate the authoritative check to axe.
  const names = await new AxeBuilder({ page })
    .withTags(WCAG_AA_TAGS)
    .options({
      runOnly: { type: 'rule', values: ['button-name', 'link-name'] },
    })
    .analyze();
  await attachA11yReport(
    testInfo,
    `${state} — button-link-name`,
    names.violations,
  );

  const blockingNames = blockingViolations(names.violations);
  expect(
    blockingNames,
    `Button/link name violations found:\n${formatViolations(blockingNames)}`,
  ).toEqual([]);

  // Screenshot into the HTML report so reviewers can see the scanned state.
  await attachScreenshot(page, testInfo, state);
}

// =============================================================================
// Index (`/diseases`, no slug) — TableOfContents
// =============================================================================

// --- Index: loading ----------------------------------------------------------

test.describe('a11y: Diseases index — loading', () => {
  test('passes axe while the disease list loads', async ({
    page,
  }, testInfo) => {
    // Keep the list request pending so the StyledCard skeletons stay on screen.
    await page.route(DISEASES_GLOB, () => new Promise<void>(() => {}));
    await page.goto(INDEX_ROUTE, { waitUntil: 'domcontentloaded' });

    // Landmark + the static index h1 render immediately (no data needed).
    await expect(page.getByRole('main')).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 1, name: /diseases and conditions/i }),
    ).toBeVisible();
    // The disease search box is part of the static index chrome.
    const search = page.getByRole('textbox', { name: /search for a disease/i });
    await expect(search).toBeVisible();
    await expect(search).toBeEditable();

    // The StyledCard loaders render Chakra `Skeleton` (`.chakra-skeleton`) while
    // `isLoading` — a CSS selector is acceptable here only because skeletons have
    // no accessible surface to target.
    await expect(page.locator('.chakra-skeleton').first()).toBeVisible();

    await runAxeScans(page, testInfo, 'index-loading');
  });
});

// --- Index: empty ------------------------------------------------------------

test.describe('a11y: Diseases index — empty', () => {
  test('passes axe with no diseases available', async ({ page }, testInfo) => {
    await page.route(DISEASES_GLOB, route =>
      route.fulfill(fulfillJson(EMPTY_DISEASES_FIXTURE)),
    );
    await page.goto(INDEX_ROUTE, { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('main')).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 1, name: /diseases and conditions/i }),
    ).toBeVisible();
    // The SectionSearch result counter reflects the (empty) filtered list: a
    // fixture-only proof that the `['diseases']` query resolved to no data.
    await expect(page.getByText(/^0 results\.$/)).toBeVisible();
    // No disease cards/links rendered.
    await expect(page.getByRole('link', { name: /learn about/i })).toHaveCount(
      0,
    );

    await runAxeScans(page, testInfo, 'index-empty');
  });
});

// --- Index: populated --------------------------------------------------------

test.describe('a11y: Diseases index — populated', () => {
  test('passes axe with a populated disease list', async ({
    page,
  }, testInfo) => {
    await page.route(DISEASES_GLOB, route =>
      route.fulfill(fulfillJson(DISEASE_LIST_FIXTURE)),
    );
    await page.goto(INDEX_ROUTE, { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('main')).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 1, name: /diseases and conditions/i }),
    ).toBeVisible();
    // Content only the fixture renders — a card's "Learn about …" link — proves
    // the `['diseases']` query resolved and we're scanning the populated grid.
    await expect(
      page.getByRole('link', {
        name: /learn about asthma resources in the niaid data ecosystem/i,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', {
        name: /learn about influenza resources in the niaid data ecosystem/i,
      }),
    ).toBeVisible();
    // The disease search box must be programmatically labelled.
    const search = page.getByRole('textbox', { name: /search for a disease/i });
    await expect(search).toBeVisible();
    await expect(search).toBeEditable();

    await runAxeScans(page, testInfo, 'index-populated');
  });
});

// --- Index: error ------------------------------------------------------------

test.describe('a11y: Diseases index — error', () => {
  test('passes axe in the index error state', async ({ page }, testInfo) => {
    // A 5xx makes `fetchAllDiseasePages` throw, so the `['diseases']` query
    // errors and TableOfContents renders its inline error branch. (A bare abort
    // throws `undefined`, which react-query does not register as an error.)
    await page.route(DISEASES_GLOB, fail500);
    await page.goto(INDEX_ROUTE, { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('main')).toBeVisible();
    // The error branch still renders the SectionHeader h1 plus the inline
    // "Error loading diseases:" message.
    await expect(
      page.getByRole('heading', { level: 1, name: /diseases and conditions/i }),
    ).toBeVisible();
    await expect(page.getByText(/error loading diseases/i)).toBeVisible();

    await runAxeScans(page, testInfo, 'index-error');
  });
});

// =============================================================================
// Disease page (`/diseases/asthma`) — DiseaseContent
// =============================================================================

// --- Disease page: loading (charts) ------------------------------------------

test.describe('a11y: Disease page — charts loading', () => {
  test('passes axe while the charts load', async ({ page }, testInfo) => {
    // Resolve the Strapi refetch so the intro renders our fixture, but hold the
    // chart APIs pending so the ChartWrapper skeletons stay on screen.
    await page.route(DISEASES_GLOB, route =>
      route.fulfill(fulfillJson(DISEASE_FIXTURE)),
    );
    await page.route(QUERY_GLOB, () => new Promise<void>(() => {}));
    await page.route(METADATA_GLOB, () => new Promise<void>(() => {}));
    await page.goto(DISEASE_ROUTE, { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('main')).toBeVisible();
    // The intro h1 is the disease title; the fixture-only subtitle proves the
    // client mock (not the SSR seed) owns the DOM.
    await expect(
      page.getByRole('heading', { level: 1, name: /^asthma$/i }),
    ).toBeVisible();
    await expect(page.getByText(DISEASE_SUBTITLE)).toBeVisible();
    // Charts still loading: ChartWrapper Skeletons (`.chakra-skeleton`).
    await expect(page.locator('.chakra-skeleton').first()).toBeVisible();

    await runAxeScans(page, testInfo, 'disease-charts-loading');
  });
});

// --- Disease page: populated (charts rendered) -------------------------------
//
// Scans the full disease page with all four visualizations rendered from the
// fixtures above (data-types donut, sources bar chart, conditions-of-access
// stacked bar, and the treemap/brushable list across three property facets).
// Rendering the charts originally surfaced four real serious violations, all now
// fixed in the chart components (see those files for the rationale comments):
//   - aria-prohibited-attr — brushable-bar-chart's focusable container now has
//     role="group" so its aria-label is permitted.
//   - tabindex (>0) + nested-interactive — the donut no longer wraps each slice
//     in a focusable `<g tabindex>`; the slice `<a>` is the sole focusable
//     element and carries the focus-driven tooltip.
//   - link-name — each stacked-bar segment `<a>` (which wraps only a `<rect>`)
//     now has an aria-label.
test.describe('a11y: Disease page — populated', () => {
  test('passes axe with the intro and all charts rendered', async ({
    page,
  }, testInfo) => {
    await page.route(DISEASES_GLOB, route =>
      route.fulfill(fulfillJson(DISEASE_FIXTURE)),
    );
    await page.route(QUERY_GLOB, route =>
      route.fulfill(fulfillJson(QUERY_FIXTURE)),
    );
    await page.route(METADATA_GLOB, route =>
      route.fulfill(fulfillJson(METADATA_FIXTURE)),
    );
    await page.goto(DISEASE_ROUTE, { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('main')).toBeVisible();
    // Intro h1 + fixture-only subtitle prove the Strapi mock owns the DOM.
    await expect(
      page.getByRole('heading', { level: 1, name: /^asthma$/i }),
    ).toBeVisible();
    await expect(page.getByText(DISEASE_SUBTITLE)).toBeVisible();
    // The charts overview heading carries the fixture-only total count, proving
    // the `**/query*` mock owns the DOM.
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: new RegExp(`${TOTAL_COUNT_LABEL} asthma related resources`, 'i'),
      }),
    ).toBeVisible();
    // Key links expose accessible names: the intro "Learn more" link and an
    // external-resources link.
    await expect(
      page.getByRole('link', {
        name: /learn more about niaid.s efforts to address this disease/i,
      }),
    ).toBeVisible();
    // Scope to the external-links section: the footer renders an identically
    // named NIAID link, so an unscoped match is ambiguous.
    await expect(
      page.locator('#external-links').getByRole('link', {
        name: /national institute of allergy and infectious diseases/i,
      }),
    ).toBeVisible();

    await runAxeScans(page, testInfo, 'disease-populated');
  });
});

// --- Disease page: error -----------------------------------------------------

test.describe('a11y: Disease page — error', () => {
  test('passes axe in the disease error state', async ({ page }, testInfo) => {
    // `getStaticProps` seeds `initialData` from the real slug (server-side), then
    // the client refetch 5xxs → the disease query's `error` is set and the page
    // swaps its content for the shared `<Error>` block. Charts never mount.
    await page.route(DISEASES_GLOB, fail500);
    await page.route(QUERY_GLOB, route =>
      route.fulfill(fulfillJson(QUERY_FIXTURE)),
    );
    await page.route(METADATA_GLOB, route =>
      route.fulfill(fulfillJson(METADATA_FIXTURE)),
    );
    await page.goto(DISEASE_ROUTE, { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('main')).toBeVisible();
    // The shared <Error> renders an h2 (no h1 on this state) plus the route's
    // "API Request:" detail text.
    await expect(
      page.getByRole('heading', { level: 2, name: /something went wrong/i }),
    ).toBeVisible();
    await expect(page.getByText(/API Request:/i)).toBeVisible();

    await runAxeScans(page, testInfo, 'disease-error');
  });
});
