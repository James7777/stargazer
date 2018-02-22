
import StellarSdk from 'stellar-sdk';

const networkList = [{
	name:	'Public',
	phrase: 'Public Global Stellar Network ; September 2015',
	server: 'https://horizon.stellar.org'
}, {
	name:	'Testnet',
	phrase: 'Test SDF Network ; September 2015',
	server: 'https://horizon-testnet.stellar.org'
}];
const fees = {};

const publicNetwork = getHash('Public Global Stellar Network ; September 2015');

function getHash(passphrase) {
	return new StellarSdk.Network(passphrase)
	.networkId()
	.toString('hex')
	.slice(0, 8);
}

const networks = {};
networkList.forEach(network => {
	const hash = getHash(network.phrase);
	networks[hash] = network;
});

function getServer(hash) {
	const url = networks[hash].server;
	return new StellarSdk.Server(url);
}

function getFees(hash) {

	if (!(hash in fees)) {

		const server = getServer(hash);
		server.ledgers().order('desc').limit(1).call()
		.then(res => {
			const ledger = res.records[0];
			fees[hash] = {
				baseFee: ledger.base_fee,
				baseReserve: ledger.base_reserve
			};
		});

		fees[hash] = {
			baseFee: 100,
			baseReserve: '0.5'
		};
	}

	return fees[hash];
}

export default {
	public: publicNetwork,
	getHash: getHash,
	getFees: getFees,
	getMinimumAccountBalance: hash => getFees(hash).baseReserve * 2,

	getNetwork: function (hash) {
		if (!hash) {
			hash = publicNetwork;
		}
		return networks[hash];
	},

	getNetworks: () => networkList,
	getServer: getServer
};
