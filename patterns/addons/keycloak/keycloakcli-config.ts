export let keycloakConfigCli = {
  keycloakConfigCli: {
    enabled: true,
    backoffLimit: 3,
    configuration: {
      "realm.json": {
        realm: "keycloak-blog",
        enabled: true,
        roles: {
          realm: [
            {
              name: "admin",
            },
          ],
        },
        users: [
          {
            username: "admin",
            email: "admin@keycloak",
            enabled: true,
            firstName: "Admin",
            realmRoles: ["admin"],
            credentials: [
              {
                type: "password",
                value: "keycloak",
              },
            ],
          },
        ],
        clients: [
          {
            clientId: "https://${WORKSPACE_ENDPOINT}/saml/metadata",
            name: "amazon-managed-grafana",
            enabled: true,
            protocol: "saml",
            adminUrl: "https://${WORKSPACE_ENDPOINT}/login/saml",
            redirectUris: ["https://${WORKSPACE_ENDPOINT}/saml/acs"],
            attributes: {
              "saml.authnstatement": "true",
              "saml.server.signature": "true",
              saml_name_id_format: "email",
              saml_force_name_id_format: "true",
              "saml.assertion.signature": "true",
              "saml.client.signature": "false",
            },
            defaultClientScopes: [],
            protocolMappers: [
              {
                name: "name",
                protocol: "saml",
                protocolMapper: "saml-user-property-mapper",
                consentRequired: false,
                config: {
                  "attribute.nameformat": "Unspecified",
                  "user.attribute": "firstName",
                  "attribute.name": "displayName",
                },
              },
              {
                name: "email",
                protocol: "saml",
                protocolMapper: "saml-user-property-mapper",
                consentRequired: false,
                config: {
                  "attribute.nameformat": "Unspecified",
                  "user.attribute": "email",
                  "attribute.name": "mail",
                },
              },
              {
                name: "role list",
                protocol: "saml",
                protocolMapper: "saml-role-list-mapper",
                config: {
                  single: "true",
                  "attribute.nameformat": "Unspecified",
                  "attribute.name": "role",
                },
              },
            ],
          },
        ],
      },
    },
  },
};
