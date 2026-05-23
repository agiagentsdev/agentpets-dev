import { siteConfig } from "@/lib/site-config";

export function buildOpenApiSpec() {
  return {
    openapi: "3.1.0",
    info: {
      title: "AgentPets Public API",
      version: "1.0.0",
      description:
        "Public API for AgentPets pets, creators, README badges, and embed snippets.",
      license: {
        name: "MIT",
        url: `${siteConfig.repoUrl}/blob/main/LICENSE`,
      },
    },
    servers: [{ url: siteConfig.url }],
    tags: [
      { name: "Pets", description: "Browse and fetch approved pets." },
      { name: "Creators", description: "Creator leaderboard and public stats." },
      { name: "Share", description: "Badges and embeddable pet cards." },
    ],
    paths: {
      "/api/v1/pets": {
        get: {
          tags: ["Pets"],
          summary: "List public pets",
          parameters: [
            queryParam("limit", "integer", "Number of pets to return."),
            queryParam("cursor", "integer", "Pagination cursor."),
            queryParam("q", "string", "Keyword or vibe search query."),
            queryParam("kind", "string", "Filter by creature, object, or character."),
            queryParam("vibe", "string", "Filter by pet vibe."),
            queryParam(
              "sort",
              "string",
              "curated, popular, installed, alpha, or recent.",
            ),
          ],
          responses: {
            "200": jsonResponse("Paginated pet catalog.", {
              $ref: "#/components/schemas/PetListEnvelope",
            }),
          },
        },
      },
      "/api/v1/pets/{slug}": {
        get: {
          tags: ["Pets"],
          summary: "Fetch one public pet",
          parameters: [pathParam("slug", "Pet slug.")],
          responses: {
            "200": jsonResponse("Pet payload.", {
              $ref: "#/components/schemas/PetEnvelope",
            }),
            "404": jsonResponse("Pet not found.", {
              $ref: "#/components/schemas/ErrorEnvelope",
            }),
          },
        },
      },
      "/api/v1/creators": {
        get: {
          tags: ["Creators"],
          summary: "List top creators",
          parameters: [
            queryParam(
              "metric",
              "string",
              "pets, likes, installs, rising, or collectors.",
            ),
            queryParam("limit", "integer", "Number of creators to return."),
          ],
          responses: {
            "200": jsonResponse("Creator leaderboard.", {
              $ref: "#/components/schemas/CreatorListEnvelope",
            }),
          },
        },
      },
      "/api/v1/badge/{slug}": {
        get: {
          tags: ["Share"],
          summary: "Render an SVG README badge",
          parameters: [pathParam("slug", "Pet slug.")],
          responses: {
            "200": {
              description: "SVG badge.",
              content: { "image/svg+xml": { schema: { type: "string" } } },
            },
          },
        },
      },
      "/api/v1/embed/{slug}": {
        get: {
          tags: ["Share"],
          summary: "Fetch embed snippet for a pet",
          parameters: [pathParam("slug", "Pet slug.")],
          responses: {
            "200": jsonResponse("Embed snippet and pet payload.", {
              $ref: "#/components/schemas/EmbedEnvelope",
            }),
          },
        },
      },
    },
    components: {
      schemas: {
        EnvelopeBase: {
          type: "object",
          properties: {
            apiVersion: { type: "string" },
            generatedAt: { type: "string", format: "date-time" },
          },
          required: ["apiVersion", "generatedAt"],
        },
        Pet: {
          type: "object",
          properties: {
            slug: { type: "string" },
            name: { type: "string" },
            description: { type: "string" },
            kind: { type: "string" },
            vibes: { type: "array", items: { type: "string" } },
            tags: { type: "array", items: { type: "string" } },
            assets: { type: "object" },
            links: { type: "object" },
            install: { type: "object" },
            metrics: { type: "object" },
            seo: { type: "object" },
            creator: { type: ["object", "null"] },
          },
          required: ["slug", "name", "description", "kind", "assets", "links"],
        },
        Creator: {
          type: "object",
          properties: {
            rank: { type: "integer" },
            id: { type: "string" },
            handle: { type: "string" },
            name: { type: "string" },
            avatarUrl: { type: ["string", "null"] },
            url: { type: "string" },
            stats: { type: "object" },
          },
        },
        PetListEnvelope: {
          allOf: [
            { $ref: "#/components/schemas/EnvelopeBase" },
            {
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    items: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Pet" },
                    },
                    paging: { type: "object" },
                    search: { type: "object" },
                  },
                },
              },
            },
          ],
        },
        PetEnvelope: {
          allOf: [
            { $ref: "#/components/schemas/EnvelopeBase" },
            {
              type: "object",
              properties: {
                data: { $ref: "#/components/schemas/Pet" },
              },
            },
          ],
        },
        CreatorListEnvelope: {
          allOf: [
            { $ref: "#/components/schemas/EnvelopeBase" },
            {
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    items: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Creator" },
                    },
                  },
                },
              },
            },
          ],
        },
        EmbedEnvelope: {
          allOf: [
            { $ref: "#/components/schemas/EnvelopeBase" },
            {
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    html: { type: "string" },
                    pet: { $ref: "#/components/schemas/Pet" },
                  },
                },
              },
            },
          ],
        },
        ErrorEnvelope: {
          allOf: [
            { $ref: "#/components/schemas/EnvelopeBase" },
            {
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: { error: { type: "string" } },
                },
              },
            },
          ],
        },
      },
    },
  } as const;
}

function queryParam(name: string, type: string, description: string) {
  return {
    name,
    in: "query",
    required: false,
    schema: { type },
    description,
  };
}

function pathParam(name: string, description: string) {
  return {
    name,
    in: "path",
    required: true,
    schema: { type: "string" },
    description,
  };
}

function jsonResponse(description: string, schema: object) {
  return {
    description,
    content: {
      "application/json": { schema },
    },
  };
}
