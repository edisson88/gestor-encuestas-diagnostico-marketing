import { existsSync, copyFileSync } from 'node:fs';
for (const dir of ['core-service-api', 'web-app']) {
 const target = `${dir}/.env`;
 if (!existsSync(target)) { copyFileSync(`${dir}/.env.example`, target); console.log(`Creado ${target}`); }
 else console.log(`Se conserva ${target}`);
}
