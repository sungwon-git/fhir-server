/*eslint no-unused-vars: "warn"*/

const { VERSIONS } = require('@asymmetrik/node-fhir-server-core').constants;
const { resolveSchema } = require('@asymmetrik/node-fhir-server-core');
const FHIRServer = require('@asymmetrik/node-fhir-server-core');
const { ObjectID } = require('mongodb');
const logger = require('@asymmetrik/node-fhir-server-core').loggers.get();
const globals = require('../../globals');
const { COLLECTION, CLIENT_DB } = require('../../constants');

let getOperation = (base_version) => {
  return resolveSchema(base_version, 'Organization');
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
  let base = args['base'];
  let code = args['code'];
  let date = args['date'];
  let description = args['description'];
  let instance = args['instance'];
  let jurisdiction = args['jurisdiction'];
  let kind = args['kind'];
  let name = args['name'];
  let param_profile = args['param-profile'];
  let publisher = args['publisher'];
  let status = args['status'];
  let system = args['system'];
  let type = args['type'];
  let url = args['url'];
  let version = args['version'];
};

module.exports.count = (args) =>
  new Promise((resolve, reject) => {
    logger.info('Organization >>> searchById');

    let db = globals.get(CLIENT_DB);
    let collection = db.collection(`${COLLECTION.ORGANIZATION}`);

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
//     logger.info('Organization >>> search');

//     let { base_version } = args;
//     let query = {};

//     if (base_version === VERSIONS['3_0_1']) {
//       query = buildStu3SearchQuery(args);
//     } else if (base_version === VERSIONS['1_0_2']) {
//       query = buildDstu2SearchQuery(args);
//     } else {
//       query = buildStu3SearchQuery(args);
//     }

//     // Grab an instance of our DB and collection
//     let db = globals.get(CLIENT_DB);
//     // let collection = db.collection(`${COLLECTION.PATIENT}_${base_version}`);
//     let collection = db.collection(`${COLLECTION.ORGANIZATION}`);
//     let Organization = getPatient(base_version);

//     // Query our collection for this observation
//     collection.find(query, (err, data) => {
//       if (err) {
//         logger.error('Error with Patient.search: ', err);
//         return reject(err);
//       }

//       // Patient is a patient cursor, pull documents out before resolving
//       data.toArray().then((organizations) => {
//         organizations.forEach(function (element, i, returnArray) {
//           returnArray[i] = new Organization(element);
//         });
//         resolve(organizations);
//       });
//     });
//   });

module.exports.searchById = (args) =>
  new Promise((resolve, reject) => {
    logger.info('Organization >>> searchById');

    let { base_version, id } = args;
    let Organization = getOperation(base_version);

    let db = globals.get(CLIENT_DB);
    let collection = db.collection(`${COLLECTION.ORGANIZATION}`);

    collection.findOne({ id: id.toString() }, (err, organization) => {
      if (err) {
        logger.error('Error with Organization.searchById: ', err);
        return reject(err);
      }
      if (organization) {
        // console.log(organization);
        resolve(new Organization(organization));
      }
      resolve();
    });
  });

// module.exports.create = (args, { req }) =>
//   new Promise((resolve, reject) => {
//     logger.info('Organization >>> create');

//     let { base_version, resource } = args;
//     // Make sure to use this ID when inserting this resource
//     let id = new ObjectID().toString();

//     let Organization = getOperationDefinition(base_version);
//     let Meta = getMeta(base_version);

//     // TODO: determine if client/server sets ID

//     // Cast resource to Organization Class
//     let operationdefinition_resource = new Organization(resource);
//     operationdefinition_resource.meta = new Meta();
//     // TODO: set meta info

//     // TODO: save record to database

//     // Return Id
//     resolve({ id });
//   });

// module.exports.update = (args, { req }) =>
//   new Promise((resolve, reject) => {
//     logger.info('Organization >>> update');

//     let { base_version, id, resource } = args;

//     let Organization = getOperationDefinition(base_version);
//     let Meta = getMeta(base_version);

//     // Cast resource to Organization Class
//     let operationdefinition_resource = new Organization(resource);
//     operationdefinition_resource.meta = new Meta();
//     // TODO: set meta info, increment meta ID

//     // TODO: save record to database

//     // Return id, if recorded was created or updated, new meta version id
//     resolve({
//       id: operationdefinition_resource.id,
//       created: false,
//       resource_version: operationdefinition_resource.meta.versionId,
//     });
//   });

// module.exports.remove = (args, context) =>
//   new Promise((resolve, reject) => {
//     logger.info('Organization >>> remove');

//     let { id } = args;

//     // TODO: delete record in database (soft/hard)

//     // Return number of records deleted
//     resolve({ deleted: 0 });
//   });

// module.exports.searchByVersionId = (args, context) =>
//   new Promise((resolve, reject) => {
//     logger.info('Organization >>> searchByVersionId');

//     let { base_version, id, version_id } = args;

//     let Organization = getOperationDefinition(base_version);

//     // TODO: Build query from Parameters

//     // TODO: Query database

//     // Cast result to Organization Class
//     let operationdefinition_resource = new Organization();

//     // Return resource class
//     resolve(operationdefinition_resource);
//   });

// module.exports.history = (args, context) =>
//   new Promise((resolve, reject) => {
//     logger.info('Organization >>> history');

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
//     let base = args['base'];
//     let code = args['code'];
//     let date = args['date'];
//     let description = args['description'];
//     let instance = args['instance'];
//     let jurisdiction = args['jurisdiction'];
//     let kind = args['kind'];
//     let name = args['name'];
//     let param_profile = args['param-profile'];
//     let publisher = args['publisher'];
//     let status = args['status'];
//     let system = args['system'];
//     let type = args['type'];
//     let url = args['url'];
//     let version = args['version'];

//     // TODO: Build query from Parameters

//     // TODO: Query database

//     let Organization = getOperationDefinition(base_version);

//     // Cast all results to Organization Class
//     let operationdefinition_resource = new Organization();

//     // Return Array
//     resolve([operationdefinition_resource]);
//   });

// module.exports.historyById = (args, context) =>
//   new Promise((resolve, reject) => {
//     logger.info('Organization >>> historyById');

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
//     let base = args['base'];
//     let code = args['code'];
//     let date = args['date'];
//     let description = args['description'];
//     let instance = args['instance'];
//     let jurisdiction = args['jurisdiction'];
//     let kind = args['kind'];
//     let name = args['name'];
//     let param_profile = args['param-profile'];
//     let publisher = args['publisher'];
//     let status = args['status'];
//     let system = args['system'];
//     let type = args['type'];
//     let url = args['url'];
//     let version = args['version'];

//     // TODO: Build query from Parameters

//     // TODO: Query database

//     let Organization = getOperationDefinition(base_version);

//     // Cast all results to Organization Class
//     let operationdefinition_resource = new Organization();

//     // Return Array
//     resolve([operationdefinition_resource]);
//   });
