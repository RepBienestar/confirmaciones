// build-config.js
const fs = require ( 'fs' );
const path = require ( 'path' );

// Lee angular.json
const angularConfigPath = path.join ( __dirname, 'angular.json' );
const angularConfig = JSON.parse ( fs.readFileSync ( angularConfigPath, 'utf8' ) );

// Obtiene el primer proyecto del archivo (el nombre no importa)
const projectName = Object.keys ( angularConfig.projects )[ 0 ];
const outputPath = angularConfig.projects[ projectName ].architect.build.options.outputPath;

// Arma la ruta dinámicamente
const assetsDir = path.join ( __dirname, outputPath, 'assets' );
const prodFile = path.join ( assetsDir, 'config.prod.js' );
const targetFile = path.join ( assetsDir, 'config.js' );

if ( !fs.existsSync ( prodFile ) ) {
    console.error ( `❌ No se encontró ${ prodFile }.` );
    process.exit ( 1 );
}

fs.copyFileSync ( prodFile, targetFile );
fs.unlinkSync ( prodFile );

console.log ( `✅ ${ prodFile } renombrado como ${ targetFile }` );
