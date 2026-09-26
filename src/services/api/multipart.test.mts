import { AxiosHeaders } from 'axios';
import { removeJsonContentTypeForMultipart } from './multipart.ts';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

// This test exercises the exact function used by the production interceptor.
// Run with: node --experimental-strip-types src/services/api/multipart.test.mts
const multipartHeaders = new AxiosHeaders({ 'Content-Type': 'application/json' });
const formData = new FormData();
formData.append('file', new Blob(['image']), 'image.jpg');
assert(removeJsonContentTypeForMultipart({ data: formData, headers: multipartHeaders }), 'FormData must be detected as multipart');
assert(!multipartHeaders.has('Content-Type'), 'FormData must not retain a JSON Content-Type');

const jsonHeaders = new AxiosHeaders({ 'Content-Type': 'application/json' });
assert(!removeJsonContentTypeForMultipart({ data: { title: 'Yeyamo' }, headers: jsonHeaders }), 'A JSON request must not be treated as multipart');
assert(jsonHeaders.get('Content-Type') === 'application/json', 'A JSON request must preserve its Content-Type');

console.info('api-client multipart transport: PASS');
