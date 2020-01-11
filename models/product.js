const fs = require('fs');
const path = require('path');
const p = path.join(path.dirname(process.mainModule.filename),
'data','products.json');
const Cart = require('./cart');
const getProductsFromFile = cb => {
    fs.readFile(p, (err,fileContent) => {
        if(err){
            return cb([]);
        }
        cb(JSON.parse(fileContent));
    });
}

module.exports = class Product {
    constructor(id, title, imageUrl, description, price){
        this.id = id;
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }

    save(){
        //temprorarily assining a ID. This will be replaced with
        //business logic later.
        getProductsFromFile(  products => {
            if(this.id) {
                const existingProductIndex = products.findIndex(prod =>
                    prod.id === this.id);
                const updatedProducts = [...products];
                updatedProducts[existingProductIndex] = this;
                fs.writeFile(p, JSON.stringify(updatedProducts), err => {
                    console.log(err);
                });
            } 
            else {      
                this.id = Math.random().toString();
                products.push(this);
                fs.writeFile(p, JSON.stringify(products), err => {
                    console.log(err);
                });
            }
        });
    }

    static deletebyId(id){

        getProductsFromFile(products => {

            const product = products.find(prod => prod.id === id);
            const updatedProducts  = products.filter(prod => prod.id !== id);
            fs.writeFile(p, JSON.stringify(updatedProducts), err=> {
                if(!err){
                    Cart.deleteProduct(id,product.price);
                }
            });
        })
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
