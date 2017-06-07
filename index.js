const markerBegin = '<x:xmpmeta';
const markerEnd = '</x:xmpmeta>';

const bufferLimit = 65536;

const knownTags = [
	'dc:subject', //aka "Keywords"
    'RDF:rdf',
    'RDF:Description'
];
knownTags.includes = includes;

const knownAttributes = [];
knownAttributes.includes = includes;

const envelopeTags = [
	'rdf:Bag',
	'rdf:Alt',
	'rdf:Seq',
	'rdf:li'
];

function includes (value) {
    for(entry of this){ 
        if(value===entry) {
            return true;
        }
    }
    return false;
};


let bufferToPromise = (buffer, tags) => new Promise((resolve, reject) => {

    try{
    
        //set Metadata tags to read from buffer
        var newTags = tags || {};
        if(typeof newTags.ns != "undefined" && typeof newTags.tags != "undefined") {
            var tagKeys = Object.keys(newTags.tags);
            var attrKeys = Object.keys(newTags.attributes);

            //add tag name to knownTags
            for(key of tagKeys) {
                if(!knownTags.includes(newTags.ns+":"+key)){
                    knownTags.push(newTags.ns+":"+key);
                }
            }
            //add attribute name to knownAttributes
            for(key of attrKeys) {
                if(!knownAttributes.includes(newTags.ns+":"+key)){
                    knownAttributes.push(newTags.ns+":"+key);
                }
            }
            
        }

        if (!Buffer.isBuffer(buffer)) 
            { reject('Not a Buffer'); }
        else {    
            let data = {raw: {}};
            let offsetBegin = buffer.indexOf(markerBegin);
            let offsetEnd = buffer.indexOf(markerEnd);
            if (offsetBegin && offsetEnd) {

                const parser = require("sax").parser(true);
                let xmlBuffer = buffer.slice(offsetBegin, offsetEnd + markerEnd.length);
                let nodeName;
                data.raw = xmlBuffer.toString('utf-8', 0, xmlBuffer.length);
                let tmp = "";

                parser.onerror = (err) => reject(err);
                parser.onend = () => { console.log(tmp); resolve(data); }

                parser.onopentag = function (node) {
                    if (knownTags.indexOf(node.name) != -1) {
                        nodeName = node.name; 
                    }
                    else if (envelopeTags.indexOf(node.name) == -1) {
                        nodeName = null;
                    }
                };
                
                parser.onattribute = function (attr) {
                
                    if (knownAttributes.indexOf(attr.name) != -1) {
                        var attrName = attr.name.slice(newTags.ns.length+1);
                        data[attrName] = parseInt(attr.value);
                    }
                }

                parser.ontext = function(text) {
                
                    if (text.trim() != '') {
                    
                        switch(nodeName) {
                            case 'dc:subject':
                                data.raw[nodeName] = text;
                                let textParts = text.split(':', 2);
                                if(textParts.length = 2)
                                    data[textParts[0]] = Number(textParts[1]);
                                tmp += text+"; ";
                                break;  
                            default:
                                data.raw[nodeName] = text;
                                data[nodeName] = parseInt(text);
                                break;
                        }

                    }
                };

                parser.write(xmlBuffer.toString('utf-8', 0, xmlBuffer.length)).close();
            }
            else {
                reject("Did not find: '<x:xmpmeta' and '</x:xmpmeta>' Invalid XMP");
            }
        }
        
    }catch (e) { reject("other error: "+ e.message);}
    
});

let promiseToCallback = (promise, callback) => {
	if ('function' == typeof callback) promise.then(
		(data) => callback(null, data),
		(error) => callback(error)
	);
	return promise;
};

module.exports = (buffer, tags, callback) => promiseToCallback(bufferToPromise(buffer, tags), callback);
