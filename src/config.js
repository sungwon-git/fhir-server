const { VERSIONS } = require('@asymmetrik/node-fhir-server-core').constants;
const env = require('var');

/**
 * @name mongoConfig
 * @summary Configurations for our Mongo instance
 */
let mongoConfig = {
  // connection: `mongodb+srv://${env.MONGO_HOSTNAME}`,
  connection: 'mongodb://swjung:tjddnjs77!@localhost:27017',
  db_name: env.MONGO_DB_NAME,
  options: {
    auto_reconnect: true,
    useUnifiedTopology: true,
  },
};

// Set up whitelist
let whitelist_env = (env.WHITELIST && env.WHITELIST.split(',').map((host) => host.trim())) || false;

// If no whitelist is present, disable cors
// If it's length is 1, set it to a string, so * works
// If there are multiple, keep them as an array
let whitelist = whitelist_env && whitelist_env.length === 1 ? whitelist_env[0] : whitelist_env;

/**
 * @name fhirServerConfig
 * @summary @asymmetrik/node-fhir-server-core configurations.
 */
let fhirServerConfig = {
  auth: {
    // This servers URI
    resourceServer: env.RESOURCE_SERVER,
    //
    // if you use this strategy, you need to add the corresponding env vars to docker-compose
    //
    strategy: {
      name: 'bearer',
      useSession: false,
      service: './src/strategies/bearer.strategy.js',
    },
  },
  server: {
    // support various ENV that uses PORT vs SERVER_PORT
    port: process.env.PORT || env.PORT || env.SERVER_PORT,
    // allow Access-Control-Allow-Origin
    corsOptions: {
      maxAge: 86400,
      // origin: ['http://localhost:3000', 'http://localhost:3001', 'https://localhost:8000'],
      origin: 'http://localhost:3000',
      credentials: true,
    },
  },
  logging: {
    level: env.LOGGING_LEVEL,
  },
  //
  // If you want to set up conformance statement with security enabled
  // Uncomment the following block
  //
  security: [
    {
      url: 'authorize',
      valueUri: `${env.AUTH_SERVER_URI}/authorize`,
    },
    {
      url: 'token',
      valueUri: `${env.AUTH_SERVER_URI}/token`,
    },
    // optional - registration
  ],
  //
  // Add any profiles you want to support.  Each profile can support multiple versions
  // if supported by core.  To support multiple versions, just add the versions to the array.
  //
  // Example:
  // Account: {
  //		service: './src/services/account/account.service.js',
  //		versions: [ VERSIONS['4_0_0'], VERSIONS['3_0_1'], VERSIONS['1_0_2'] ]
  // },
  //
  profiles: {
    // Account: {
    //   service: './src/services/account/account.service.js',
    //   versions: [VERSIONS['4_0_0']],
    // },
    // AllergyIntolerance: {
    //   service: './src/services/allergyintolerance/allergyintolerance.service.js',
    //   versions: [VERSIONS['4_0_0']],
    // },
    // Claim: {
    //   service: './src/services/claim/claim.service.js',
    //   versions: [VERSIONS['4_0_0']],
    // },

    Patient: {
      service: './src/services/patient/patient.service.js',
      versions: [VERSIONS['4_0_0']],
      operation: [
        {
          name: 'count',
          route: '/$count',
          method: 'GET',
        },
      ],
    },
    Organization: {
      service: './src/services/organization/organization.service.js',
      versions: [VERSIONS['4_0_0']],
      operation: [
        {
          name: 'count',
          route: '/$count',
          method: 'GET',
        },
      ],
    },
    Practitioner: {
      service: './src/services/practitioner/practitioner.service.js',
      versions: [VERSIONS['4_0_0']],
      operation: [
        {
          name: 'count',
          route: '/$count',
          method: 'GET',
        },
      ],
    },
    PractitionerRole: {
      service: './src/services/practitionerrole/practitionerrole.service.js',
      versions: [VERSIONS['4_0_0']],
      operation: [
        {
          name: 'count',
          route: '/$count',
          method: 'GET',
        },
      ],
    },
    Condition: {
      service: './src/services/condition/condition.service.js',
      versions: [VERSIONS['4_0_0']],
      operation: [
        {
          name: 'count',
          route: '/$count',
          method: 'GET',
        },
      ],
    },
    Procedure: {
      service: './src/services/procedure/procedure.service.js',
      versions: [VERSIONS['4_0_0']],
      operation: [
        {
          name: 'count',
          route: '/$count',
          method: 'GET',
        },
      ],
    },
    Encounter: {
      service: './src/services/encounter/encounter.service.js',
      versions: [VERSIONS['4_0_0']],
      operation: [
        {
          name: 'count',
          route: '/$count',
          method: 'GET',
        },
      ],
    },
    MedicationRequest: {
      service: './src/services/medicationrequest/medicationrequest.service.js',
      versions: [VERSIONS['4_0_0']],
      operation: [
        {
          name: 'count',
          route: '/$count',
          method: 'GET',
        },
      ],
    },
    Medication: {
      service: './src/services/medication/medication.service.js',
      versions: [VERSIONS['4_0_0']],
      operation: [
        {
          name: 'count',
          route: '/$count',
          method: 'GET',
        },
      ],
    },
    Composition: {
      service: './src/services/composition/composition.service.js',
      versions: [VERSIONS['4_0_0']],
      operation: [
        {
          name: 'document',
          route: '/:id/$document',
          method: 'GET',
        },
        {
          name: 'documents',
          route: '/$documents/:patientId',
          method: 'GET',
        },
        {
          name: 'count',
          route: '/$count',
          method: 'GET',
        },
      ],
    },
  },
};

module.exports = {
  fhirServerConfig,
  mongoConfig,
};
