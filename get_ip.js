import os from 'os';

const interfaces = os.networkInterfaces();
const addresses = [];
for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        if (iface.family === 'IPv4' && !iface.internal) {
            addresses.push({ name, address: iface.address });
        }
    }
}
console.log(JSON.stringify(addresses, null, 2));
