/*eslint no-unused-vars: "warn"*/

const { VERSIONS } = require('@asymmetrik/node-fhir-server-core').constants;
const { resolveSchema } = require('@asymmetrik/node-fhir-server-core');
const FHIRServer = require('@asymmetrik/node-fhir-server-core');
const { ObjectID } = require('mongodb');
const logger = require('@asymmetrik/node-fhir-server-core').loggers.get();

const globals = require('../../globals');
const { COLLECTION, CLIENT_DB } = require('../../constants');

const {
  // stringQueryBuilder,
  // tokenQueryBuilder,
  referenceQueryBuilder,
  // addressQueryBuilder,
  // nameQueryBuilder,
  // dateQueryBuilder,
} = require('../../utils/querybuilder.util');

let getEncounter = (base_version) => {
  return resolveSchema(base_version, 'Encounter');
};

let getMeta = (base_version) => {
  return resolveSchema(base_version, 'Meta');
};

module.exports.count = (args) =>
  new Promise((resolve, reject) => {
    logger.info('Encounter >>> searchById');

    let db = globals.get(CLIENT_DB);
    let collection = db.collection(`${COLLECTION.ENCOUNTER}`);

    collection.countDocuments({}, (err, data) => {
      if (err) {
        logger.error('Error with Encounter.count: ', err);
        return reject(err);
      }
      return resolve(data);
    });
  });

const buildSearchQuery = (args) => {
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
  let attester = args['attester'];
  let author = args['author'];
  let _class = args['_class'];
  let confidentiality = args['confidentiality'];
  let _context = args['_context'];
  let date = args['date'];
  let encounter = args['encounter'];
  let entry = args['entry'];
  let identifier = args['identifier'];
  let patient = args['patient'];
  let period = args['period'];
  let related_id = args['related-id'];
  let related_ref = args['related-ref'];
  let section = args['section'];
  let status = args['status'];
  let subject = args['subject'];
  let title = args['title'];
  let type = args['type'];

  let query = {};
  let ors = [];

  if (subject) {
    let queryBuilder = referenceQueryBuilder(subject, 'subject.reference');
    for (let i in queryBuilder) {
      query[i] = queryBuilder[i];
    }
  }

  return query;
};

module.exports.search = (args) =>
  new Promise((resolve, reject) => {
    logger.info('Encounter >>> search');
    console.log('Encounter >>> search', args);
    let { base_version } = args;
    let query = {};

    query = buildSearchQuery(args);
    console.log('Encounter search query is : ', query);

    if (!args['subject']) {
      console.log('Encounter >>> search', 'args[subject] is not ...');
      return resolve();
    }

    let db = globals.get(CLIENT_DB);
    let collection = db.collection(`${COLLECTION.ENCOUNTER}`);
    let Encounter = getEncounter(base_version);

    // Query our collection for this observation
    collection.find(query, (err, data) => {
      if (err) {
        logger.error('Error with Encounter.search: ', err);
        return reject(err);
      }

      // Patient is a patient cursor, pull documents out before resolving
      data.toArray().then((encounters) => {
        encounters.forEach(function (element, i, returnArray) {
          returnArray[i] = new Encounter(element);
        });
        resolve(encounters);
      });
    });
  });

module.exports.searchById = (args) =>
  new Promise((resolve, reject) => {
    logger.info('Encounter >>> searchById');

    let { base_version, id } = args;
    let Encounter = getEncounter(base_version);

    // Grab an instance of our DB and collection
    let db = globals.get(CLIENT_DB);
    let collection = db.collection(`${COLLECTION.ENCOUNTER}`);

    // Query our collection for this observation
    collection.findOne({ id: id.toString() }, (err, encounter) => {
      if (err) {
        logger.error('Error with Encounter.searchById: ', err);
        return reject(err);
      }
      if (encounter) {
        resolve(new Encounter(encounter));
      }
      resolve();
    });
  });

// module.exports.create = (args, { req }) =>
//   new Promise((resolve, reject) => {
//     logger.info('Encounter >>> create');

//     let { base_version, resource } = args;
//     // Make sure to use this ID when inserting this resource
//     let id = new ObjectID().toString();

//     let Encounter = getEncounter(base_version);
//     let Meta = getMeta(base_version);

//     // TODO: determine if client/server sets ID

//     // Cast resource to Encounter Class
//     let encounter_resource = new Encounter(resource);
//     encounter_resource.meta = new Meta();
//     // TODO: set meta info

//     // TODO: save record to database

//     // Return Id
//     resolve({ id });
//   });

// module.exports.update = (args, { req }) =>
//   new Promise((resolve, reject) => {
//     logger.info('Encounter >>> update');

//     let { base_version, id, resource } = args;

//     let Encounter = getEncounter(base_version);
//     let Meta = getMeta(base_version);

//     // Cast resource to Encounter Class
//     let encounter_resource = new Encounter(resource);
//     encounter_resource.meta = new Meta();
//     // TODO: set meta info, increment meta ID

//     // TODO: save record to database

//     // Return id, if recorded was created or updated, new meta version id
//     resolve({
//       id: encounter_resource.id,
//       created: false,
//       resource_version: encounter_resource.meta.versionId,
//     });
//   });

// module.exports.remove = (args, context) =>
//   new Promise((resolve, reject) => {
//     logger.info('Encounter >>> remove');

//     let { id } = args;

//     // TODO: delete record in database (soft/hard)

//     // Return number of records deleted
//     resolve({ deleted: 0 });
//   });

// module.exports.searchByVersionId = (args, context) =>
//   new Promise((resolve, reject) => {
//     logger.info('Encounter >>> searchByVersionId');

//     let { base_version, id, version_id } = args;

//     let Encounter = getEncounter(base_version);

//     // TODO: Build query from Parameters

//     // TODO: Query database

//     // Cast result to Encounter Class
//     let encounter_resource = new Encounter();

//     // Return resource class
//     resolve(encounter_resource);
//   });

// module.exports.history = (args, context) =>
//   new Promise((resolve, reject) => {
//     logger.info('Encounter >>> history');

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
//     let appointment = args['appointment'];
//     let _class = args['_class'];
//     let date = args['date'];
//     let diagnosis = args['diagnosis'];
//     let episodeofcare = args['episodeofcare'];
//     let identifier = args['identifier'];
//     let incomingreferral = args['incomingreferral'];
//     let length = args['length'];
//     let location = args['location'];
//     let location_period = args['location-period'];
//     let part_of = args['part-of'];
//     let participant = args['participant'];
//     let participant_type = args['participant-type'];
//     let patient = args['patient'];
//     let practitioner = args['practitioner'];
//     let reason = args['reason'];
//     let service_provider = args['service-provider'];
//     let special_arrangement = args['special-arrangement'];
//     let status = args['status'];
//     let subject = args['subject'];
//     let type = args['type'];

//     // TODO: Build query from Parameters

//     // TODO: Query database

//     let Encounter = getEncounter(base_version);

//     // Cast all results to Encounter Class
//     let encounter_resource = new Encounter();

//     // Return Array
//     resolve([encounter_resource]);
//   });

// module.exports.historyById = (args, context) =>
//   new Promise((resolve, reject) => {
//     logger.info('Encounter >>> historyById');

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
//     let appointment = args['appointment'];
//     let _class = args['_class'];
//     let date = args['date'];
//     let diagnosis = args['diagnosis'];
//     let episodeofcare = args['episodeofcare'];
//     let identifier = args['identifier'];
//     let incomingreferral = args['incomingreferral'];
//     let length = args['length'];
//     let location = args['location'];
//     let location_period = args['location-period'];
//     let part_of = args['part-of'];
//     let participant = args['participant'];
//     let participant_type = args['participant-type'];
//     let patient = args['patient'];
//     let practitioner = args['practitioner'];
//     let reason = args['reason'];
//     let service_provider = args['service-provider'];
//     let special_arrangement = args['special-arrangement'];
//     let status = args['status'];
//     let subject = args['subject'];
//     let type = args['type'];

//     // TODO: Build query from Parameters

//     // TODO: Query database

//     let Encounter = getEncounter(base_version);

//     // Cast all results to Encounter Class
//     let encounter_resource = new Encounter();

//     // Return Array
//     resolve([encounter_resource]);
//   });
