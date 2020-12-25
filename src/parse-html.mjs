import parseFile from './parse-file.mjs';
import { getParser } from '@arijs/stream-xml-parser';
import inspect from '@arijs/frontend/src/isomorphic/utils/inspect.mjs';

export default async function parseHtml(filePath) {
	var parser = getParser();
	var parsed = await parseFile(filePath, parser);
	var error = parsed ? parsed.error : new Error(
		'Input file parsed object is empty ' +
		JSON.stringify(inspect(parsed, 1, 32)).substr(0, 512)
	);
	if (error) throw error;
	return parsed;
}
