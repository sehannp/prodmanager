const db = require('../util/database');

const Cart = require('./cart');

module.exports = class Product {
    constructor(id, title, imageUrl, description, price){
        this.id = id;
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }

    save(){
        return db.execute('INSERT INTO products (title,price,imageUrl,description) VALUES (?,?,?,?)',[this.title, this.price,this.imageUrl, this.description]);
    }

    static deletebyId(id){

    }
    //logically static functions should be on a separate class
    //put placing here just for ease of use
    static fetchAll(){
        return db.execute('SELECT * FROM products');
    }

    static findById(id){
        return db.execute('SELECT * FROM products WHERE id =?',[id]);
    }
}
