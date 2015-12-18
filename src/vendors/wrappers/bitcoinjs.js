/**
 * bitcoinjs-lib backwards compatibility lib
 * exposes some old functions for easily backporting
 */

'use strict';

define(['bitcoinjs-lib-real', 'convert'], function(Bitcoin, Convert) {
    console.log("loading bitcoinjs-lib-real");
    Bitcoin.address.validate = function(address) {
        try {
            Bitcoin.fromBase58Check(address);
            return true;
        } catch (e) {
            return false;
        }
    }
    Bitcoin.address.fromInputScript = function(script, network) {
      network = network || Bitcoin.networks.bitcoin

      var type = Bitcoin.scripts.classifyInput(script)

      if (type === 'pubkey') {
          var hash = Bitcoin.crypto.hash160(script.chunks[0]);
          return new Bitcoin.address(hash, network.pubKeyHash);
      }
      if (type === 'pubkeyhash') {
          var hash = Bitcoin.crypto.hash160(script.chunks[1]);
          return new Bitcoin.address(hash, network.pubKeyHash);
      }
      if (type === 'scripthash') {
          var hash = Bitcoin.crypto.hash160(script.chunks[script.chunks.length-1]);
          return new Bitcoin.address(hash, network.scriptHash);
      }

      // throw Error(type + ' has no matching address')
    }

    Bitcoin.address.getVersion = function(address) {
        return Bitcoin.base58check.decode(address).readUInt8(0);
    }

    Bitcoin.ECPair.fromBytes = function(bytes, compressed) {
        if (!bytes) {
            return Bitcoin.ECPair.makeRandom(compressed);
        }
        var d = Bitcoin.BigInteger.fromByteArrayUnsigned(bytes.slice(0, 32));
        if (compressed === null || compressed === undefined) compressed = (bytes[32] === 1);
        return new Bitcoin.ECPair(d, compressed);
    }
    Bitcoin.ECPair.fromBytes = function(bytes) {
        return Bitcoin.ECPair.fromBuffer(new Bitcoin.Buffer(bytes));
    }
    Bitcoin.ECPair.prototype.toBytes = function() {
         var bytes = this.d.toBuffer().toJSON().data;
         while(bytes.length < 32) bytes.unshift(0);
         if (this.pub.compressed) bytes.push(1);
         return bytes;
    }
    Bitcoin.ECPair.prototype.toBytes = function(compressed) {
         if (compressed === undefined) compressed = this.compressed;
         return this.Q.getEncoded(compressed).toJSON().data;
    }
    Bitcoin.convert = Convert;
    return Bitcoin;

});

