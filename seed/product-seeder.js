var Product = require('../models/product');

var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/shopping', {useNewUrlParser: true});

var products = [
    new Product({
        imagePath: 'https://www.flightclub.com/media/catalog/product/0/1/012597_1.jpg',
        title: 'Air Jordan Shoes',
        description: 'Awesome Shoes',
        price: 899000
    }),
    new Product({
        imagePath: 'https://m.media-amazon.com/images/G/01/2017/adidas/mockup/4-4114754._CB490843174_.jpg',
        title: 'Adidas Shoes',
        description: 'Amazing Shoes',
        price: 999000
    }),
    new Product({
        imagePath: 'http://demandware.edgesuite.net/aalw_prd/on/demandware.static/-/Sites-ConverseMaster/default/dw03503a9d/images/hi-res/159623_standard.jpg',
        title: 'Converse Shoes',
        description: 'Chuck Taylor',
        price: 699000
    })
];

var done = 0;
for (var i = 0; i < products.length; i++) {
    products[i].save(function(err, result) {
        done++;
        if (done === products.length){
            exit();
        }
    });
}

function exit() {
    mongoose.disconnect();
}