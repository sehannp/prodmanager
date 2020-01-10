const fs = require('fs');
const path = require('path');
const p = path.join(path.dirname(process.mainModule.filename),
'data','products.json');

const getProductsFromFile = cb => {
    fs.readFile(p, (err,fileContent) => {
        if(err){
            return cb([]);
        }
        cb(JSON.parse(fileContent));
    });
}

module.exports = class Product {
    constructor(title, imageUrl, description, price){
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }

    save(){
        //temprorarily assining a ID. This will be replaced with
        //business logic later.
        this.id = Math.random().toString();
        getProductsFromFile(  products => {
            products.push(this);
            fs.writeFile(p, JSON.stringify(products), err => {
                console.log(err);
            });
        });
    }

    //logically this should be on a separate class
    //put placing here just for ease of use
    static fetchAll(cb){
        getProductsFromFile(cb);
    }

    static findById(id,cb){
        getProductsFromFile(products => {
            const product = products.find(product => 
                product.id === id
            );
            cb(product);
        });
    }
}
