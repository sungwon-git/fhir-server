/*eslint no-unused-vars: "warn"*/

const { VERSIONS } = require('@asymmetrik/node-fhir-server-core').constants;
const { resolveSchema } = require('@asymmetrik/node-fhir-server-core');
const FHIRServer = require('@asymmetrik/node-fhir-server-core');
const { ObjectID } = require('mongodb');
const logger = require('@asymmetrik/node-fhir-server-core').loggers.get();

const globals = require('../../globals');
const { COLLECTION, CLIENT_DB } = require('../../constants');

let getPractitioner = (base_version) => {
  return resolveSchema(base_version, 'Practitioner');
};

let getMeta = (base_version) => {
  return resolveSchema(base_version, 'Meta');
};
let buildStu3SearchQuery = (args) => {
  // Common search params
  let {
    base_version,
    _content,
    _format,
    _id,
    _lastUpdated,
    _profile,
    _query,
    _security,
    _tag,
  } = args;

  // Search Result params
  let {
    _INCLUDE,
    _REVINCLUDE,
    _SORT,
    _COUNT,
    _SUMMARY,
    _ELEMENTS,
    _CONTAINED,
    _CONTAINEDTYPED,
  } = args;

  // Resource Specific params
  let active = args['active'];
  let address = args['address'];
  let address_city = args['address-city'];
  let address_country = args['address-country'];
  let address_postalcode = args['address-postalcode'];
  let address_state = args['address-state'];
  let address_use = args['address-use'];
  let communication = args['communication'];
  let email = args['email'];
  let family = args['family'];
  let gender = args['gender'];
  let given = args['given'];
  let identifier = args['identifier'];
  let name = args['name'];
  let phone = args['phone'];
  let phonetic = args['phonetic'];
  let telecom = args['telecom'];

  let query = {};
  let ors = [];

  return query;
};

module.exports.count = (args) =>
  new Promise((resolve, reject) => {
    logger.info('Practitioner >>> searchById');

    let db = globals.get(CLIENT_DB);
    let collection = db.collection(`${COLLECTION.PRACTITIONER}`);

    collection.countDocuments({}, (err, data) => {
      if (err) {
        logger.error('Error with Organization.count: ', err);
        return reject(err);
      }
      return resolve(data);
    });
  });

// module.exports.search = (args) =>
//   new Promise((resolve, reject) => {
//     logger.info('Practitioner >>> search');
//     let { base_version } = args;
//     let query = {};

//     if (base_version === VERSIONS['3_0_1']) {
//       query = buildStu3SearchQuery(args);
//     } else if (base_version === VERSIONS['1_0_2']) {
//       query = buildDstu2SearchQuery(args);
//     } else {
//       console.log(1, args);
//       query = buildStu3SearchQuery(args);
//       console.log(2, query);
//     }

//     // Grab an instance of our DB and collection
//     let db = globals.get(CLIENT_DB);
//     // let collection = db.collection(`${COLLECTION.PATIENT}_${base_version}`);
//     let collection = db.collection(`${COLLECTION.PRACTITIONER}`);
//     let Practitioner = getPractitioner(base_version);

//     // Query our collection for this observation
//     collection.find(query, (err, data) => {
//       if (err) {
//         logger.error('Error with Patient.search: ', err);
//         return reject(err);
//       }

//       // Patient is a patient cursor, pull documents out before resolving
//       data.toArray().then((practitioners) => {
//         practitioners.forEach(function (element, i, returnArray) {
//           returnArray[i] = new Practitioner(element);
//         });
//         resolve(practitioners);
//       });
//     });
//   });

module.exports.searchById = (args) =>
  new Promise((resolve, reject) => {
    logger.info('Practitioner >>> searchById');

    let { base_version, id } = args;
    let Practitioner = getPractitioner(base_version);

    // Grab an instance of our DB and collection
    let db = globals.get(CLIENT_DB);
    // let collection = db.collection(`${COLLECTION.PATIENT}_${base_version}`);
    let collection = db.collection(`${COLLECTION.PRACTITIONER}`);
    // Query our collection for this observation
    collection.findOne({ id: id.toString() }, (err, practitioner) => {
      if (err) {
        logger.error('Error with Practitioner.searchById: ', err);
        return reject(err);
      }
      if (practitioner) {
        resolve(new Practitioner(practitioner));
      }
      resolve();
    });
  });

// module.exports.create = (args, { req }) =>
//   new Promise((resolve, reject) => {
//     logger.info('Practitioner >>> create');

//     let { base_version, resource } = args;
//     // Make sure to use this ID when inserting this resource
//     let id = new ObjectID().toString();

//     let Practitioner = getPractitioner(base_version);
//     let Meta = getMeta(base_version);

//     // TODO: determine if client/server sets ID

//     // Cast resource to Practitioner Class
//     let practitioner_resource = new Practitioner(resource);
//     practitioner_resource.meta = new Meta();
//     // TODO: set meta info

//     // TODO: save record to database

//     // Return Id
//     resolve({ id });
//   });

// module.exports.update = (args, { req }) =>
//   new Promise((resolve, reject) => {
//     logger.info('Practitioner >>> update');

//     let { base_version, id, resource } = args;

//     let Practitioner = getPractitioner(base_version);
//     let Meta = getMeta(base_version);

//     // Cast resource to Practitioner Class
//     let practitioner_resource = new Practitioner(resource);
//     practitioner_resource.meta = new Meta();
//     // TODO: set meta info, increment meta ID

//     // TODO: save record to database

//     // Return id, if recorded was created or updated, new meta version id
//     resolve({
//       id: practitioner_resource.id,
//       created: false,
//       resource_version: practitioner_resource.meta.versionId,
//     });
//   });

// module.exports.remove = (args, context) =>
//   new Promise((resolve, reject) => {
//     logger.info('Practitioner >>> remove');

//     let { id } = args;

//     // TODO: delete record in database (soft/hard)

//     // Return number of records deleted
//     resolve({ deleted: 0 });
//   });

// module.exports.searchByVersionId = (args, context) =>
//   new Promise((resolve, reject) => {
//     logger.info('Practitioner >>> searchByVersionId');

//     let { base_version, id, version_id } = args;

//     let Practitioner = getPractitioner(base_version);

//     // TODO: Build query from Parameters

//     // TODO: Query database

//     // Cast result to Practitioner Class
//     let practitioner_resource = new Practitioner();

//     // Return resource class
//     resolve(practitioner_resource);
//   });

// module.exports.history = (args, context) =>
//   new Promise((resolve, reject) => {
//     logger.info('Practitioner >>> history');

//     // Common search params
//     let {
//       base_version,
//       _content,
//       _format,
//       _id,
//       _lastUpdated,
//       _profile,
//       _query,
//       _security,
//       _tag,
//     } = args;

//     // Search Result params
//     let {
//       _INCLUDE,
//       _REVINCLUDE,
//       _SORT,
//       _COUNT,
//       _SUMMARY,
//       _ELEMENTS,
//       _CONTAINED,
//       _CONTAINEDTYPED,
//     } = args;

//     // Resource Specific params
//     let active = args['active'];
//     let address = args['address'];
//     let address_city = args['address-city'];
//     let address_country = args['address-country'];
//     let address_postalcode = args['address-postalcode'];
//     let address_state = args['address-state'];
//     let address_use = args['address-use'];
//     let communication = args['communication'];
//     let email = args['email'];
//     let family = args['family'];
//     let gender = args['gender'];
//     let given = args['given'];
//     let identifier = args['identifier'];
//     let name = args['name'];
//     let phone = args['phone'];
//     let phonetic = args['phonetic'];
//     let telecom = args['telecom'];

//     // TODO: Build query from Parameters

//     // TODO: Query database

//     let Practitioner = getPractitioner(base_version);

//     // Cast all results to Practitioner Class
//     let practitioner_resource = new Practitioner();

//     // Return Array
//     resolve([practitioner_resource]);
//   });

// module.exports.historyById = (args, context) =>
//   new Promise((resolve, reject) => {
//     logger.info('Practitioner >>> historyById');

//     // Common search params
//     let {
//       base_version,
//       _content,
//       _format,
//       _id,
//       _lastUpdated,
//       _profile,
//       _query,
//       _security,
//       _tag,
//     } = args;

//     // Search Result params
//     let {
//       _INCLUDE,
//       _REVINCLUDE,
//       _SORT,
//       _COUNT,
//       _SUMMARY,
//       _ELEMENTS,
//       _CONTAINED,
//       _CONTAINEDTYPED,
//     } = args;

//     // Resource Specific params
//     let active = args['active'];
//     let address = args['address'];
//     let address_city = args['address-city'];
//     let address_country = args['address-country'];
//     let address_postalcode = args['address-postalcode'];
//     let address_state = args['address-state'];
//     let address_use = args['address-use'];
//     let communication = args['communication'];
//     let email = args['email'];
//     let family = args['family'];
//     let gender = args['gender'];
//     let given = args['given'];
//     let identifier = args['identifier'];
//     let name = args['name'];
//     let phone = args['phone'];
//     let phonetic = args['phonetic'];
//     let telecom = args['telecom'];

//     // TODO: Build query from Parameters

//     // TODO: Query database

//     let Practitioner = getPractitioner(base_version);

//     // Cast all results to Practitioner Class
//     let practitioner_resource = new Practitioner();

//     // Return Array
//     resolve([practitioner_resource]);
//   });
