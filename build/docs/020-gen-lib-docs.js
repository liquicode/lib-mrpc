"use strict";


const LIB_PATH = require( 'path' );
const LIB_FS = require( 'fs' );

// Load the project's package.json file.
const PACKAGE = require( '../../package.json' );

// Load the project's readme.md file.
var README_MD = null;
{
	let filename = './README.md';
	if ( LIB_FS.existsSync( filename ) )
	{
		README_MD = LIB_FS.readFileSync( filename, 'utf-8' );
	}
	else
	{
		filename = './readme.md';
		if ( LIB_FS.existsSync( filename ) )
		{
			README_MD = LIB_FS.readFileSync( filename, 'utf-8' );
		}
	}
}


//=====================================================================
//=====================================================================
//
//		FUNCTIONS
//
//=====================================================================
//=====================================================================

//---------------------------------------------------------------------
// Get all files in a path, recursively.
function get_file_list( Path )
{
	let files_found = [];
	let filenames = LIB_FS.readdirSync( Path );
	filenames.forEach(
		filename =>
		{
			let filepath = LIB_PATH.join( Path, filename );
			if ( LIB_FS.statSync( filepath ).isDirectory() )
			{
				files_found.push( ...get_file_list( filepath ) );
			}
			else
			{
				files_found.push( filepath );
			}
		} );
	return files_found;
}


//---------------------------------------------------------------------
// Get all the doc sections from a file.
function get_doc_sections( Filename )
{
	try
	{
		let module = require( Filename );
		let sections = [];
		if ( module._docs )
		{
			sections = module._docs;
		}
		return sections;
	}
	catch ( error )
	{
		// console.error( `Error processing [${Filename}].`, error );
	}
}


//=====================================================================
//=====================================================================
//
//		MAIN EXECUTION
//
//=====================================================================
//=====================================================================

let doc_sections = [];

// Start.
console.log( `gen-lib-docs is starting.` );

// Get the command line arguments.
let docs_folder = LIB_PATH.resolve( process.argv[ 2 ] || './docs' );
let source_folders = process.argv.splice( 3 );
source_folders.forEach( ( folder, index ) => source_folders[ index ] = LIB_PATH.resolve( source_folders[ index ] ) );
console.log( `docs_folder:` );
console.log( `\t${docs_folder}` );
console.log( `source_folders:` );
source_folders.forEach( folder => console.log( `\t${folder}` ) );

// Validate the command line arguments.
if ( !LIB_FS.existsSync( docs_folder ) ) { throw new Error( `docs_folder does not exist [${docs_folder}].` ); }
source_folders.forEach( folder => { if ( !LIB_FS.existsSync( folder ) ) { throw new Error( `source_folder does not exist [${folder}].` ); } } );

// Add the HOME page.
doc_sections.push( {
	type: "home",
	project_name: PACKAGE.name,
	project_version: PACKAGE.version,
	project_sourcecode: PACKAGE.repository.url,
	project_homepage: PACKAGE.homepage,
	description: README_MD,
} );

// Scan the source files.
source_folders.forEach(
	source_folder => 
	{
		console.log( `In [${source_folder}]` );
		let source_file_list = get_file_list( source_folder );
		source_file_list.forEach(
			source_file =>
			{
				console.log( `\tScanning [${LIB_PATH.basename( source_file )}]` );
				let sections = get_doc_sections( source_file );
				if ( sections && sections.length ) 
				{
					console.log( `\t\t- Found ${sections.length} doc sections.` );
					doc_sections.push( ...sections );
				}
			} );
	} );

// Save the doc sections.
let output_filename = PACKAGE.name;
if ( output_filename.indexOf( '/' ) ) { output_filename = output_filename.substr( output_filename.indexOf( '/' ) + 1 ); }
output_filename = LIB_PATH.join( docs_folder, output_filename + '.json' );
LIB_FS.writeFileSync( output_filename, JSON.stringify( doc_sections, null, '\t' ) );

// Finish.
console.log( `gen-lib-docs is finished.` );
process.exit( 0 );
