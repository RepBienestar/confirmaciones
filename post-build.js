/* jshint esversion: 6 */
const fs = require ( 'fs' );
const path = require ( 'path' );

// Leer angular.json para detectar el outputPath dinámicamente
const angularConfigPath = path.join ( __dirname, 'angular.json' );
const angularConfig = JSON.parse ( fs.readFileSync ( angularConfigPath, 'utf8' ) );
const projectName = Object.keys ( angularConfig.projects )[ 0 ]; // primer proyecto
const outputPath = angularConfig.projects[ projectName ].architect.build.options.outputPath;

// Ruta al index.html generado dinámicamente
const indexPath = path.join ( __dirname, outputPath, 'index.html' );

if ( !fs.existsSync ( indexPath ) ) {
    console.error ( `❌ No se encontró ${ indexPath }. Asegúrate de haber hecho el build antes de ejecutar post-build.` );
    process.exit ( 1 );
}

let indexHtml = fs.readFileSync ( indexPath, 'utf8' );

// Generar la versión basada en la fecha y hora actual
const now = new Date ();
const version = `${ now.getFullYear () }${ ( now.getMonth () + 1 ).toString ().padStart ( 2, '0' ) }${ now.getDate ().toString ().padStart ( 2, '0' ) }${ now.getHours ().toString ().padStart ( 2, '0' ) }${ now.getMinutes ().toString ().padStart ( 2, '0' ) }${ now.getSeconds ().toString ().padStart ( 2, '0' ) }`;

// Agregar el parámetro de versión a los scripts JS
indexHtml = indexHtml.replace (
    /(<script\s+[^>]*src="[^"]+\.js)([^>]*>)/g,
    ( match, p1, p2 ) => `${ p1 }?version=${ version }${ p2 }`
);

// Escribir los cambios de vuelta en index.html
fs.writeFileSync ( indexPath, indexHtml );

console.log ( `✅ Versionado agregado a scripts en ${ indexPath }` );
