# Template: pet approved → #showcase

The AgentPets Bot uses this template when posting an approved pet. The
bot replaces the placeholders with values from the webhook payload.

---

🎉 **{{displayName}}** just landed on AgentPets.

> {{description}}

Submitted by <@{{discordUserId}}> · catch them all at
https://agentpets.dev/pets/{{slug}}

`npx -y https://github.com/agiagentsdev/agentpets-dev/releases/latest/download/agentpets-cli.tgz install {{slug}}`

---

**Embed**

- title: {{displayName}}
- description: first 200 chars of {{description}}
- url: https://agentpets.dev/pets/{{slug}}
- image: https://agentpets.dev/pets/{{slug}}/opengraph-image
- color: 0x5266EA
- fields:
  - name: kind, value: {{kind}}, inline: true
  - name: tags, value: first 4 tags joined by " · ", inline: true
  - name: install, value: `npx -y https://github.com/agiagentsdev/agentpets-dev/releases/latest/download/agentpets-cli.tgz install {{slug}}`, inline: false

If the submitter doesn't have a linked Discord account yet, drop the
`<@…>` mention and use their AgentPets display name as plain text instead.
