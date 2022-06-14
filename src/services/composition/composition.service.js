/*eslint no-unused-vars: "warn"*/

const { VERSIONS } = require('@asymmetrik/node-fhir-server-core').constants;
const { resolveSchema } = require('@asymmetrik/node-fhir-server-core');
const FHIRServer = require('@asymmetrik/node-fhir-server-core');
const { ObjectID } = require('mongodb');
const logger = require('@asymmetrik/node-fhir-server-core').loggers.get();

const globals = require('../../globals');
const { COLLECTION, CLIENT_DB } = require('../../constants');
const { getUuid } = require('../../utils/uid.util');
const moment = require('moment-timezone');

const PatientOperation = require('../patient/patient.service');
const PractitionerRoleOperation = require('../practitionerrole/practitionerrole.service');
const PractitionerOp = require('../practitioner/practitioner.service');
const OrganizationOperation = require('../organization/organization.service');
const ConditionOp = require('../condition/condition.service');
const MedicationRequestOp = require('../medicationrequest/medicationrequest.service');
const ProcedureOp = require('../procedure/procedure.service');
const MedicationOp = require('../medication/medication.service');
const EncounterOp = require('../encounter/encounter.service');

const {
  stringQueryBuilder,
  tokenQueryBuilder,
  referenceQueryBuilder,
  addressQueryBuilder,
  nameQueryBuilder,
  dateQueryBuilder,
} = require('../../utils/querybuilder.util');

let getComposition = (base_version) => {
  return resolveSchema(base_version, 'Composition');
};

let getBundle = (base_version) => {
  return resolveSchema(base_version, 'Bundle');
};

let getMeta = (base_version) => {
  return resolveSchema(base_version, 'Meta');
};

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

module.exports.count = (args) =>
  new Promise((resolve, reject) => {
    logger.info('Composition >>> searchById');

    let db = globals.get(CLIENT_DB);
    let collection = db.collection(`${COLLECTION.COMPOSITION}`);

    collection.countDocuments({}, (err, data) => {
      if (err) {
        logger.error('Error with Composition.count: ', err);
        return reject(err);
      }
      return resolve(data);
    });
  });

module.exports.search = (args) =>
  new Promise((resolve, reject) => {
    logger.info('Composition >>> search');
    console.log(args);
    let { base_version } = args;
    let query = {};

    query = buildSearchQuery(args);
    console.log(query);

    if (!args['subject']) {
      console.log('none');
      return resolve();
    }

    let db = globals.get(CLIENT_DB);
    let collection = db.collection(`${COLLECTION.COMPOSITION}`);
    let Composition = getComposition(base_version);

    // Query our collection for this observation
    collection.find(query, (err, data) => {
      if (err) {
        logger.error('Error with Composition.search: ', err);
        return reject(err);
      }

      // Patient is a patient cursor, pull documents out before resolving
      data.toArray().then((compositions) => {
        compositions.forEach(function (element, i, returnArray) {
          returnArray[i] = new Composition(element);
        });
        resolve(compositions);
      });
    });
  });

module.exports.searchById = (args) =>
  new Promise((resolve, reject) => {
    logger.info('Composition >>> searchById');

    let { base_version, id } = args;
    let Composition = getComposition(base_version);
    console.log(131);

    // Grab an instance of our DB and collection
    let db = globals.get(CLIENT_DB);
    console.log(132);
    // let collection = db.collection(`${COLLECTION.PATIENT}_${base_version}`);
    let collection = db.collection(`${COLLECTION.COMPOSITION}`);
    // Query our collection for this observation
    console.log(133, id.toString());
    collection.findOne({ id: id.toString() }, (err, composition) => {
      if (err) {
        console.log(134);
        logger.error('Error with Composition.searchById: ', err);
        return reject(err);
      }
      if (composition) {
        console.log(135);
        return resolve(new Composition(composition));
      } else {
        console.log(136);
        return reject('no data');
      }
      // resolve();
    });
  });

module.exports.document = (args, context, logger) =>
  new Promise(async (resolve, reject) => {
    logger.info('Composition >>> Generate a Document');

    let { base_version, id } = args;
    const base_url = 'http://localhost:4000/4_0_0';

    let Bundle = getBundle(base_version);
    let bundle = new Bundle();

    let compositionResource = await this.searchById(args);

    bundle.id = compositionResource.id;
    let Meta = getMeta(base_version);
    bundle.meta = new Meta({
      versionId: '1',
      lastUpdated: moment.utc().format('YYYY-MM-DDTHH:mm:ssZ'),
    });

    bundle.type = 'document';
    bundle.timestamp = moment.utc().format('YYYY-MM-DDTHH:mm:ssZ');

    // let compositionResource = await this.searchById(args);

    let entries = [];
    entries.push({
      fullUrl: `${base_url}/Composition/${id}`,
      resource: compositionResource,
    });

    // console.log(JSON.stringify(resource));

    // 환자 검색
    let patientId = compositionResource.subject.reference.toString();
    patientId = patientId.split('/');
    let patientResource = await PatientOperation.searchById({
      base_version: '4_0_0',
      id: patientId[1],
    });

    entries.push({
      fullUrl: `${base_url}/Patient/${patientId[1]}`,
      resource: patientResource,
    });

    // console.log(JSON.stringify(patientResource));

    // author 검색
    let practitionerRoleId = compositionResource.author[0].reference.toString();
    practitionerRoleId = practitionerRoleId.split('/');
    let practitionerRoleResource = await PractitionerRoleOperation.searchById({
      base_version: base_version,
      id: practitionerRoleId[1],
    });

    entries.push({
      fullUrl: `${base_url}/PractitionerRole/${practitionerRoleId[1]}`,
      resource: practitionerRoleResource,
    });

    // practitioner 검색
    if (practitionerRoleResource.practitioner) {
      let practitionerId = practitionerRoleResource.practitioner.reference;
      practitionerId = practitionerId.split('/');
      let practitionerResource = await PractitionerOp.searchById({
        base_version: base_version,
        id: practitionerId[1],
      });

      entries.push({
        fullUrl: `${base_url}/Practioner/${practitionerId[1]}`,
        resource: practitionerResource,
      });
    }

    // console.log(JSON.stringify(practitionerRoleResource));

    // attester 검색
    // let attesterId = compositionResource.attester[0].party.reference.toString();
    // attesterId = attesterId.split('/');
    // let attesterResource = await PractitionerRoleOperation.searchById({
    //   base_version: '4_0_0',
    //   id: attesterId[1],
    // });

    // entries.push({
    //   fullUrl: `${base_url}/PractionerRole/${attesterId[1]}`,
    //   resource: attesterResource,
    // });

    // organization
    let custodianId = compositionResource.custodian.reference.toString();
    custodianId = custodianId.split('/');
    let organization = await OrganizationOperation.searchById({
      base_version: '4_0_0',
      id: custodianId[1],
    });

    entries.push({
      fullUrl: `${base_url}/Organization/${custodianId[1]}`,
      resource: organization,
    });

    // encounter
    let encounterResource = await EncounterOp.searchById(args);

    entries.push({
      fullUrl: `${base_url}/Encounter/${id}`,
      resource: encounterResource,
    });

    const sectionCount = compositionResource.section.length;
    for (let i = 0; i < sectionCount; i++) {
      const sectionCode = compositionResource.section[i].code.coding[0].code;

      const entryCount = compositionResource.section[i].entry.length;
      console.log(entryCount);

      for (let j = 0; j < entryCount; j++) {
        let referenceId = compositionResource.section[i].entry[j].reference.toString();
        referenceId = referenceId.split('/');

        if (sectionCode === '11450-4') {
          let condition = await ConditionOp.searchById({
            base_version: base_version,
            id: referenceId[1],
          });
          // console.log(JSON.stringify(condition));
          entries.push({
            fullUrl: `${base_url}/Condition/${referenceId[1]}`,
            resource: condition,
          });
        } else if (sectionCode === '57833-6') {
          let medicationrequest = await MedicationRequestOp.searchById({
            base_version: base_version,
            id: referenceId[1],
          });
          // console.log(medicationrequest.medicationReference.reference);
          entries.push({
            fullUrl: `${base_url}/MedicationRequest/${referenceId[1]}`,
            resource: medicationrequest,
          });

          if (medicationrequest.medicationReference) {
            let medicationId = medicationrequest.medicationReference.reference;
            medicationId = medicationId.split('/');
            console.log(medicationId[1]);
            let medication = await MedicationOp.searchById({
              base_version: base_version,
              id: medicationId[1],
            });
            entries.push({
              fullUrl: `${base_url}/Medication/${medicationId[1]}`,
              resource: medication,
            });
          }
        } else if (sectionCode === '47519-4') {
          let procedure = await ProcedureOp.searchById({
            base_version: base_version,
            id: referenceId[1],
          });
          // console.log(JSON.stringify(procedure));
          entries.push({
            fullUrl: `${base_url}/Procedure/${referenceId[1]}`,
            resource: procedure,
          });
        }
      }
    }

    bundle.entry = entries;

    // bundle.id = getUuid(bundle);

    return resolve(bundle);
  });

module.exports.documents = (args, context, logger) =>
  new Promise(async (resolve, reject) => {
    logger.info('Composition >>> create documets');
    // console.log(args);
    // console.log(context);
    // console.log(context.req.params); // { base_version: '4_0_0', patientId: '113610' }

    const { base_version, patientId } = context.req.params;
    const searchArgs = {
      base_version: base_version,
      subject: `Patient/${patientId}`,
    };

    const resources = await this.search(searchArgs);
    let composition_docs = [];
    for (let i = 0; i < resources.length; i++) {
      const documentArgs = {
        base_version: base_version,
        id: resources[i].id,
      };

      composition_docs.push(await this.document(documentArgs, '', logger));
    }

    return resolve(composition_docs);
  });

// module.exports.create = (args, { req }) =>
//   new Promise((resolve, reject) => {
//     logger.info('Composition >>> create');

//     let { base_version, resource } = args;
//     // Make sure to use this ID when inserting this resource
//     let id = new ObjectID().toString();

//     let Composition = getComposition(base_version);
//     let Meta = getMeta(base_version);

//     // TODO: determine if client/server sets ID

//     // Cast resource to Composition Class
//     let composition_resource = new Composition(resource);
//     composition_resource.meta = new Meta();
//     // TODO: set meta info

//     // TODO: save record to database

//     // Return Id
//     resolve({ id });
//   });

// module.exports.update = (args, { req }) =>
//   new Promise((resolve, reject) => {
//     logger.info('Composition >>> update');

//     let { base_version, id, resource } = args;

//     let Composition = getComposition(base_version);
//     let Meta = getMeta(base_version);

//     // Cast resource to Composition Class
//     let composition_resource = new Composition(resource);
//     composition_resource.meta = new Meta();
//     // TODO: set meta info, increment meta ID

//     // TODO: save record to database

//     // Return id, if recorded was created or updated, new meta version id
//     resolve({
//       id: composition_resource.id,
//       created: false,
//       resource_version: composition_resource.meta.versionId,
//     });
//   });

// module.exports.remove = (args, context) =>
//   new Promise((resolve, reject) => {
//     logger.info('Composition >>> remove');

//     let { id } = args;

//     // TODO: delete record in database (soft/hard)

//     // Return number of records deleted
//     resolve({ deleted: 0 });
//   });

// module.exports.searchByVersionId = (args, context) =>
//   new Promise((resolve, reject) => {
//     logger.info('Composition >>> searchByVersionId');

//     let { base_version, id, version_id } = args;

//     let Composition = getComposition(base_version);

//     // TODO: Build query from Parameters

//     // TODO: Query database

//     // Cast result to Composition Class
//     let composition_resource = new Composition();

//     // Return resource class
//     resolve(composition_resource);
//   });

// module.exports.history = (args, context) =>
//   new Promise((resolve, reject) => {
//     logger.info('Composition >>> history');

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
//     let attester = args['attester'];
//     let author = args['author'];
//     let _class = args['_class'];
//     let confidentiality = args['confidentiality'];
//     let _context = args['_context'];
//     let date = args['date'];
//     let encounter = args['encounter'];
//     let entry = args['entry'];
//     let identifier = args['identifier'];
//     let patient = args['patient'];
//     let period = args['period'];
//     let related_id = args['related-id'];
//     let related_ref = args['related-ref'];
//     let section = args['section'];
//     let status = args['status'];
//     let subject = args['subject'];
//     let title = args['title'];
//     let type = args['type'];

//     // TODO: Build query from Parameters

//     // TODO: Query database

//     let Composition = getComposition(base_version);

//     // Cast all results to Composition Class
//     let composition_resource = new Composition();

//     // Return Array
//     resolve([composition_resource]);
//   });

// module.exports.historyById = (args, context) =>
//   new Promise((resolve, reject) => {
//     logger.info('Composition >>> historyById');

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
//     let attester = args['attester'];
//     let author = args['author'];
//     let _class = args['_class'];
//     let confidentiality = args['confidentiality'];
//     let _context = args['_context'];
//     let date = args['date'];
//     let encounter = args['encounter'];
//     let entry = args['entry'];
//     let identifier = args['identifier'];
//     let patient = args['patient'];
//     let period = args['period'];
//     let related_id = args['related-id'];
//     let related_ref = args['related-ref'];
//     let section = args['section'];
//     let status = args['status'];
//     let subject = args['subject'];
//     let title = args['title'];
//     let type = args['type'];

//     // TODO: Build query from Parameters

//     // TODO: Query database

//     let Composition = getComposition(base_version);

//     // Cast all results to Composition Class
//     let composition_resource = new Composition();

//     // Return Array
//     resolve([composition_resource]);
//   });
