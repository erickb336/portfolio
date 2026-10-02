import fs from 'node:fs';
import Ajv2020 from 'ajv/dist/2020.js';
import standaloneCode from 'ajv/dist/standalone/index.js';
const schema=JSON.parse(fs.readFileSync('contract/workstation/heartbeat.v1.schema.json','utf8'));
const ajv=new Ajv2020({allErrors:true,strict:true,code:{source:true,esm:true}});
ajv.addSchema(schema);
const code=standaloneCode(ajv,{validateRoot:schema.$id,validateHeartbeat:`${schema.$id}#/$defs/heartbeat`,validateDailyUsage:`${schema.$id}#/$defs/dailyUsage`});
fs.writeFileSync('server/workstation/schema-validator.js','// Generated with Ajv 8.20.0; run node scripts/compile-workstation-schema.mjs.\nimport ucs2length from \'ajv/dist/runtime/ucs2length.js\';\n'+code.replace('require("ajv/dist/runtime/ucs2length").default','ucs2length.default'));
